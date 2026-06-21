import { type FastifyInstance } from "fastify"

import {
	registerDeviceHandler,
	getDevicesHandler,
	deviceHeartbeatHandler,
	getDeviceStatusHandler,
} from "@/controllers/device"
import {
	registerDeviceSchema,
	getDevicesSchema,
	deviceHeartbeatSchema,
	getDeviceStatusSchema,
} from "@/models/schemas/device"

export default (fastify: FastifyInstance) => {
	fastify.route({
		handler: registerDeviceHandler,
		method: "POST",
		schema: registerDeviceSchema,
		url: "/devices",
	})

	fastify.route({
		handler: getDevicesHandler,
		method: "GET",
		schema: getDevicesSchema,
		url: "/devices",
	})

	fastify.route({
		handler: deviceHeartbeatHandler,
		method: "POST",
		schema: deviceHeartbeatSchema,
		url: "/devices/:deviceId/heartbeat",
	})

	fastify.route({
		handler: getDeviceStatusHandler,
		method: "GET",
		schema: getDeviceStatusSchema,
		url: "/devices/status",
	})
}
