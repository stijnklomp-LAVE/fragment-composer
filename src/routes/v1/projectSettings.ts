import { type FastifyInstance } from "fastify"

import {
	getProjectSettingsHandler,
	updateProjectSettingsHandler,
} from "@/controllers/projectSettings"
import {
	getProjectSettingsSchema,
	updateProjectSettingsSchema,
} from "@/models/schemas/projectSettings"

export default (fastify: FastifyInstance) => {
	fastify.route({
		handler: getProjectSettingsHandler,
		method: "GET",
		schema: getProjectSettingsSchema,
		url: "/projects/:projectId/settings",
	})

	fastify.route({
		handler: updateProjectSettingsHandler,
		method: "PUT",
		schema: updateProjectSettingsSchema,
		url: "/projects/:projectId/settings",
	})
}
