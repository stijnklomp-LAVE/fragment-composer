import { type FastifyInstance } from "fastify"

import healthRoutes from "./health"
import authMiddleware from "@/middleware/auth"
import deviceRoute from "./v1/device"
import projectRoute from "./v1/project"
import transferRequestRoute from "./v1/transferRequest"
import signalingRoute from "./v1/signaling"

export const registerRoutes = async (fastify: FastifyInstance) => {
	await fastify.register(healthRoutes)

	// All v1 routes require JWT authentication
	await fastify.register(
		async (v1) => {
			await v1.register(authMiddleware)

			await v1.register(deviceRoute)
			await v1.register(projectRoute)
			await v1.register(transferRequestRoute)
			await v1.register(signalingRoute)
		},
		{ prefix: "/v1" },
	)
}
