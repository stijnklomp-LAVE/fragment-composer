import { type FastifyInstance } from "fastify"

import {
	cancelParticipantHandler,
	createTransferRequestHandler,
	deleteTransferRequestHandler,
	getTransferRequestsHandler,
	respondToTransferRequestHandler,
} from "@/controllers/transferRequest"
import {
	cancelParticipantSchema,
	createTransferRequestSchema,
	deleteTransferRequestSchema,
	getTransferRequestsSchema,
	respondToTransferRequestSchema,
} from "@/models/schemas/transferRequest"

export default (fastify: FastifyInstance) => {
	fastify.route({
		handler: getTransferRequestsHandler,
		method: "GET",
		schema: getTransferRequestsSchema,
		url: "/transfer-requests",
	})

	fastify.route({
		handler: createTransferRequestHandler,
		method: "POST",
		schema: createTransferRequestSchema,
		url: "/transfer-requests",
	})

	fastify.route({
		handler: respondToTransferRequestHandler,
		method: "PUT",
		schema: respondToTransferRequestSchema,
		url: "/transfer-requests/:id/participants/:deviceId/respond",
	})

	fastify.route({
		handler: deleteTransferRequestHandler,
		method: "DELETE",
		schema: deleteTransferRequestSchema,
		url: "/transfer-requests/:id",
	})

	fastify.route({
		handler: cancelParticipantHandler,
		method: "PUT",
		schema: cancelParticipantSchema,
		url: "/transfer-requests/:id/participants/:deviceId/cancel",
	})
}
