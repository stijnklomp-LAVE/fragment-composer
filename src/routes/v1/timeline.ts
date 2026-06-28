import { type FastifyInstance } from "fastify"

import {
	createLayerHandler,
	createSegmentHandler,
	getTimelineHandler,
} from "@/controllers/timeline"
import {
	createLayerSchema,
	createSegmentSchema,
	getTimelineSchema,
} from "@/models/schemas/timeline"

export default (fastify: FastifyInstance) => {
	fastify.route({
		handler: getTimelineHandler,
		method: "GET",
		schema: getTimelineSchema,
		url: "/projects/:projectId/timeline",
	})

	fastify.route({
		handler: createLayerHandler,
		method: "POST",
		schema: createLayerSchema,
		url: "/projects/:projectId/layers",
	})

	fastify.route({
		handler: createSegmentHandler,
		method: "POST",
		schema: createSegmentSchema,
		url: "/projects/:projectId/layers/:layerId/segments",
	})
}
