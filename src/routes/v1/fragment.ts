import { type FastifyInstance } from "fastify"

import { createFragmentHandler } from "@/controllers/fragment"
import { createFragmentSchema } from "@/models/schemas/fragment"

export default (fastify: FastifyInstance) => {
	fastify.route({
		handler: createFragmentHandler,
		method: "POST",
		schema: createFragmentSchema,
		url: "/projects/:projectId/fragments",
	})
}
