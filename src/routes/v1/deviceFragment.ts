import { type FastifyInstance } from "fastify"

import {
	getDeviceFragmentsHandler,
	setDeviceFragmentsHandler,
} from "@/controllers/deviceFragment"
import {
	getDeviceFragmentsSchema,
	setDeviceFragmentsSchema,
} from "@/models/schemas/deviceFragment"

export default (fastify: FastifyInstance) => {
	fastify.route({
		handler: getDeviceFragmentsHandler,
		method: "GET",
		schema: getDeviceFragmentsSchema,
		url: "/device-fragments",
	})

	fastify.route({
		handler: setDeviceFragmentsHandler,
		method: "PUT",
		schema: setDeviceFragmentsSchema,
		url: "/devices/:deviceId/fragments",
	})
}
