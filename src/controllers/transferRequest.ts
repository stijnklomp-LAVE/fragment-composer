import { logger } from "@/common/logger"
import {
	cancelParticipantSchema,
	createTransferRequestSchema,
	deleteTransferRequestSchema,
	getTransferRequestsSchema,
	respondToTransferRequestSchema,
} from "@/models/schemas/transferRequest"
import {
	cancelParticipantService,
	createTransferRequestService,
	deleteTransferRequestService,
	expireTransferRequestService,
	getTransferRequestByIdService,
	getTransferRequestsForUserService,
	respondToParticipantService,
} from "@/services/transferRequest"
import { getDeviceByIdService } from "@/services/device"
import { type RouteHandler } from "@/models/types/schemaTypeExtractor"

function flattenParticipant(p: {
	deviceId: string
	role: "SOURCE" | "TARGET"
	status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED" | "COMPLETED"
	device?: { deviceName: string }
}) {
	return {
		deviceId: p.deviceId,
		deviceName: p.device?.deviceName ?? "",
		role: p.role,
		status: p.status,
	}
}

function formatResponse(data: unknown) {
	if (!data || typeof data !== "object") return data

	const d = data as Record<string, unknown>

	if (Array.isArray(d.participants)) {
		return {
			...d,
			participants: d.participants.map(flattenParticipant),
		}
	}

	return d
}

export const getTransferRequestsHandler: RouteHandler<
	typeof getTransferRequestsSchema
> = async (req, res) => {
	try {
		if (!req.userId) {
			await res.code(401).send({ error: "Unauthorized" })

			return
		}

		const requests = await getTransferRequestsForUserService(req.userId)

		await res.code(200).send({
			requests: requests.map(formatResponse),
		})
	} catch (err) {
		logger.error(err)
		await res.code(500).send({ error: "Internal Server Error" })
	}
}

export const createTransferRequestHandler: RouteHandler<
	typeof createTransferRequestSchema
> = async (req, res) => {
	try {
		if (!req.userId) {
			await res.code(401).send({ error: "Unauthorized" })

			return
		}

		const { sourceDeviceIds, targetDeviceIds } = req.body

		// Verify all source devices belong to the user
		for (const sourceId of sourceDeviceIds) {
			const device = await getDeviceByIdService(sourceId)

			if (device?.ownerId !== req.userId) {
				await res.code(404).send({
					error: `Source device ${sourceId} not found or not owned by you`,
				})

				return
			}
		}

		const creatorDeviceId = sourceDeviceIds[0] ?? targetDeviceIds[0]

		if (!creatorDeviceId) {
			await res.code(400).send({ error: "No devices provided" })

			return
		}

		const requestRec = await createTransferRequestService({
			creatorDeviceId,
			direction: req.body.direction,
			fragmentIds: req.body.fragmentIds ?? [],
			fragmentNames: req.body.fragmentNames ?? [],
			...(req.body.message !== undefined
				? { message: req.body.message }
				: {}),
			...(req.body.projectId !== undefined
				? { projectId: req.body.projectId }
				: {}),
			...(req.body.projectName !== undefined
				? { projectName: req.body.projectName }
				: {}),
			sourceDeviceIds,
			targetDeviceIds,
		})

		if (!requestRec) {
			await res.code(500).send({ error: "Failed to create request" })

			return
		}

		logger.info(
			{
				direction: req.body.direction,
				requestId: requestRec.id,
				sourceDeviceIds,
				targetDeviceIds,
			},
			"Transfer request created",
		)

		await res.code(201).send({ request: formatResponse(requestRec) })
	} catch (err) {
		logger.error(err)
		await res.code(500).send({ error: "Internal Server Error" })
	}
}

export const respondToTransferRequestHandler: RouteHandler<
	typeof respondToTransferRequestSchema
> = async (req, res) => {
	try {
		if (!req.userId) {
			await res.code(401).send({ error: "Unauthorized" })

			return
		}

		const { id, deviceId } = req.params
		const { action } = req.body

		const requestRec = await getTransferRequestByIdService(id)

		if (!requestRec) {
			await res.code(404).send({ error: "Transfer request not found" })

			return
		}

		// Verify the user owns the device
		const device = await getDeviceByIdService(deviceId)

		if (device?.ownerId !== req.userId) {
			await res.code(401).send({ error: "Unauthorized" })

			return
		}

		if (requestRec.status !== "PENDING" && requestRec.status !== "ACTIVE") {
			await res.code(400).send({
				error: `Request is ${requestRec.status.toLowerCase()}, cannot respond`,
			})

			return
		}

		if (requestRec.expiresAt < new Date()) {
			await expireTransferRequestService(requestRec.id)
			await res.code(400).send({ error: "Request has expired" })

			return
		}

		const participant = await respondToParticipantService(
			id,
			deviceId,
			action,
		)

		if (!participant) {
			await res.code(404).send({ error: "Participant not found" })

			return
		}

		logger.info(
			{
				action,
				deviceId,
				requestId: id,
			},
			`Participant ${action === "accept" ? "accepted" : "rejected"}`,
		)

		await res
			.code(200)
			.send({ participant: flattenParticipant(participant) })
	} catch (err) {
		logger.error(err)
		await res.code(500).send({ error: "Internal Server Error" })
	}
}

export const deleteTransferRequestHandler: RouteHandler<
	typeof deleteTransferRequestSchema
> = async (req, res) => {
	try {
		if (!req.userId) {
			await res.code(401).send({ error: "Unauthorized" })

			return
		}

		const { id } = req.params
		const requestRec = await getTransferRequestByIdService(id)

		if (!requestRec) {
			await res.code(404).send({ error: "Transfer request not found" })

			return
		}

		await deleteTransferRequestService(id)

		logger.info({ requestId: id }, "Transfer request deleted")
		await res.code(200).send({ message: "Request deleted" })
	} catch (err) {
		logger.error(err)
		await res.code(500).send({ error: "Internal Server Error" })
	}
}

export const cancelParticipantHandler: RouteHandler<
	typeof cancelParticipantSchema
> = async (req, res) => {
	try {
		if (!req.userId) {
			await res.code(401).send({ error: "Unauthorized" })

			return
		}

		const { id, deviceId } = req.params

		// Verify the user owns the device
		const device = await getDeviceByIdService(deviceId)

		if (device?.ownerId !== req.userId) {
			await res.code(401).send({ error: "Unauthorized" })

			return
		}

		const result = await cancelParticipantService(id, deviceId)

		if (!result.participant) {
			await res.code(404).send({ error: "Participant not found" })

			return
		}

		logger.info({ deviceId, requestId: id }, "Participant cancelled")

		await res.code(200).send({
			participant: flattenParticipant(result.participant),
		})
	} catch (err) {
		logger.error(err)
		await res.code(500).send({ error: "Internal Server Error" })
	}
}
