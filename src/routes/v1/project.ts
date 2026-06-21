import { type FastifyInstance } from "fastify"

import {
	createProjectHandler,
	deleteProjectHandler,
	getProjectHandler,
	getProjectsHandler,
	getProjectsWithFragmentsHandler,
	updateProjectHandler,
} from "@/controllers/project"
import {
	createProjectSchema,
	deleteProjectSchema,
	getProjectSchema,
	getProjectsSchema,
	getProjectsWithFragmentsSchema,
	updateProjectSchema,
} from "@/models/schemas/project"

export default (fastify: FastifyInstance) => {
	fastify.route({
		handler: getProjectsHandler,
		method: "GET",
		schema: getProjectsSchema,
		url: "/projects",
	})

	fastify.route({
		handler: createProjectHandler,
		method: "POST",
		schema: createProjectSchema,
		url: "/projects",
	})

	fastify.route({
		handler: getProjectsWithFragmentsHandler,
		method: "GET",
		schema: getProjectsWithFragmentsSchema,
		url: "/projects/with-fragments",
	})

	fastify.route({
		handler: getProjectHandler,
		method: "GET",
		schema: getProjectSchema,
		url: "/projects/:projectId",
	})

	fastify.route({
		handler: updateProjectHandler,
		method: "PUT",
		schema: updateProjectSchema,
		url: "/projects/:projectId",
	})

	fastify.route({
		handler: deleteProjectHandler,
		method: "DELETE",
		schema: deleteProjectSchema,
		url: "/projects/:projectId",
	})
}
