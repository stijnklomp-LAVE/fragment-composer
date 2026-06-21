import { logger } from "@/common/logger"
import {
	registerDeviceSchema,
	getDevicesSchema,
	deviceHeartbeatSchema,
	getDeviceStatusSchema,
} from "@/models/schemas/device"
import {
	registerDeviceService,
	getDevicesForOwnerService,
	updateDeviceHeartbeatService,
	getDeviceStatusService,
} from "@/services/device"
import { type RouteHandler } from "@/models/types/schemaTypeExtractor"

export const registerDeviceHandler: RouteHandler<
	typeof registerDeviceSchema
> = async (req, res) => {
	try {
		if (!req.userId) {
			await res.code(401).send({ error: "Unauthorized" })

			return
		}

		const device = await registerDeviceService({
			...req.body,
			ownerId: req.userId,
		})

		logger.info(
			{
				deviceId: device.deviceId,
				deviceName: device.deviceName,
			},
			"Device registered",
		)

		await res.code(201).send({
			device,
			message: "Device Registered",
		})
	} catch (err) {
		logger.error(err)
		await res.code(500).send({
			error: "Internal Server Error",
		})
	}
}

export const getDevicesHandler: RouteHandler<typeof getDevicesSchema> = async (
	req,
	res,
) => {
	try {
		if (!req.userId) {
			await res.code(401).send({ error: "Unauthorized" })

			return
		}

		const devices = await getDevicesForOwnerService(req.userId)

		await res.code(200).send({
			devices,
		})
	} catch (err) {
		logger.error(err)
		await res.code(500).send({
			error: "Internal Server Error",
		})
	}
}

export const deviceHeartbeatHandler: RouteHandler<
	typeof deviceHeartbeatSchema
> = async (req, res) => {
	try {
		if (!req.userId) {
			await res.code(401).send({ error: "Unauthorized" })

			return
		}

		await updateDeviceHeartbeatService(
			req.userId,
			req.params.deviceId,
			req.body.status,
		)

		await res.code(200).send({
			message: "Heartbeat recorded",
		})
	} catch (err) {
		logger.error(err)
		await res.code(500).send({
			error: "Internal Server Error",
		})
	}
}

export const getDeviceStatusHandler: RouteHandler<
	typeof getDeviceStatusSchema
> = async (req, res) => {
	try {
		if (!req.userId) {
			await res.code(401).send({ error: "Unauthorized" })

			return
		}

		const devices = await getDeviceStatusService(req.userId)

		await res.code(200).send({
			devices,
		})
	} catch (err) {
		logger.error(err)
		await res.code(500).send({
			error: "Internal Server Error",
		})
	}
}
