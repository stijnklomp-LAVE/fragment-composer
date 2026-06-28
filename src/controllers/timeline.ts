import { logger } from "@/common/logger"
import {
	createLayerSchema,
	createSegmentSchema,
	getTimelineSchema,
} from "@/models/schemas/timeline"
import {
	createLayerService,
	createSegmentService,
	getTimelineService,
} from "@/services/timeline"
import { type RouteHandler } from "@/models/types/schemaTypeExtractor"

export const getTimelineHandler: RouteHandler<
	typeof getTimelineSchema
> = async (req, res) => {
	try {
		if (!req.userId) {
			await res.code(401).send({ error: "Unauthorized" })

			return
		}

		const layers = await getTimelineService(
			req.params.projectId,
			req.userId,
		)

		if (!layers) {
			await res.code(404).send({ error: "Project not found" })

			return
		}

		await res.code(200).send({ layers })
	} catch (err) {
		logger.error(err)
		await res.code(500).send({ error: "Internal Server Error" })
	}
}

export const createLayerHandler: RouteHandler<
	typeof createLayerSchema
> = async (req, res) => {
	try {
		if (!req.userId) {
			logger.warn({ userId: req.userId }, "Unauthorized layer creation")
			await res.code(401).send({ error: "Unauthorized" })

			return
		}

		const layer = await createLayerService({
			ownerId: req.userId,
			projectId: req.params.projectId,
		})

		if (!layer) {
			logger.warn(
				{ projectId: req.params.projectId, userId: req.userId },
				"Project not found for layer creation",
			)
			await res.code(404).send({ error: "Project not found" })

			return
		}

		logger.info(
			{
				layerId: layer.id,
				projectId: layer.projectId,
				zIndex: layer.zIndex,
			},
			"Timeline layer created",
		)

		await res.code(201).send({ layer })
	} catch (err) {
		logger.error(err, "Failed to create layer")
		await res.code(500).send({ error: "Internal Server Error" })
	}
}

export const createSegmentHandler: RouteHandler<
	typeof createSegmentSchema
> = async (req, res) => {
	try {
		if (!req.userId) {
			await res.code(401).send({ error: "Unauthorized" })

			return
		}

		const segment = await createSegmentService({
			fragmentId: req.body.fragmentId,
			layerId: req.params.layerId,
			...(req.body.name ? { name: req.body.name } : {}),
			ownerId: req.userId,
		})

		if (!segment) {
			await res.code(404).send({
				error: "Layer, project, or fragment not found",
			})

			return
		}

		logger.info(
			{
				fragmentId: req.body.fragmentId,
				layerId: req.params.layerId,
				segmentId: segment.id,
			},
			"Timeline segment created",
		)

		await res.code(201).send({ segment })
	} catch (err) {
		logger.error(err)
		await res.code(500).send({ error: "Internal Server Error" })
	}
}
