import { logger } from "@/common/logger"
import {
	getDeviceFragmentsForOwnerService,
	setDeviceFragmentsService,
} from "@/services/deviceFragment"
import { getDeviceByIdService } from "@/services/device"
import {
	getDeviceFragmentsSchema,
	setDeviceFragmentsSchema,
} from "@/models/schemas/deviceFragment"
import { type RouteHandler } from "@/models/types/schemaTypeExtractor"

export const getDeviceFragmentsHandler: RouteHandler<
	typeof getDeviceFragmentsSchema
> = async (req, res) => {
	try {
		if (!req.userId) {
			await res.code(401).send({ error: "Unauthorized" })

			return
		}

		const deviceFragments = await getDeviceFragmentsForOwnerService(
			req.userId,
		)

		await res.code(200).send({ deviceFragments })
	} catch (err) {
		logger.error(err)
		await res.code(500).send({ error: "Internal Server Error" })
	}
}

export const setDeviceFragmentsHandler: RouteHandler<
	typeof setDeviceFragmentsSchema
> = async (req, res) => {
	try {
		if (!req.userId) {
			await res.code(401).send({ error: "Unauthorized" })

			return
		}

		const device = await getDeviceByIdService(req.params.deviceId)

		if (!device) {
			await res.code(404).send({
				error: "Device not found or not owned by you",
			})

			return
		}

		if (device.ownerId !== req.userId) {
			await res.code(401).send({
				error: "Unauthorized",
			})

			return
		}

		await setDeviceFragmentsService(
			req.params.deviceId,
			req.body.fragmentIds,
		)

		logger.info(
			{
				deviceId: req.params.deviceId,
				fragmentCount: req.body.fragmentIds.length,
			},
			"Device fragments updated",
		)

		await res.code(200).send({ message: "Device fragments updated" })
	} catch (err) {
		logger.error(err)
		await res.code(500).send({ error: "Internal Server Error" })
	}
}
