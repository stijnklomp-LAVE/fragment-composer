import { logger } from "@/common/logger"
import { createFragmentSchema } from "@/models/schemas/fragment"
import { type RouteHandler } from "@/models/types/schemaTypeExtractor"
import { getProjectByIdService } from "@/services/project"
import { createFragmentService } from "@/services/fragment"

export const createFragmentHandler: RouteHandler<
	typeof createFragmentSchema
> = async (req, res) => {
	try {
		if (!req.userId) {
			await res.code(401).send({ error: "Unauthorized" })

			return
		}

		const project = await getProjectByIdService(
			req.params.projectId,
			req.userId,
		)

		if (!project) {
			await res.code(404).send({ error: "Project not found" })

			return
		}

		const fragment = await createFragmentService({
			...req.body,
			projectId: req.params.projectId,
		})

		logger.info(
			{
				fragmentId: fragment.id,
				projectId: req.params.projectId,
			},
			"Fragment created",
		)

		await res.code(201).send({ fragment })
	} catch (err) {
		logger.error(err)
		await res.code(500).send({ error: "Internal Server Error" })
	}
}
