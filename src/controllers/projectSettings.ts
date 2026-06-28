import { logger } from "@/common/logger"
import {
	getProjectSettingsSchema,
	updateProjectSettingsSchema,
} from "@/models/schemas/projectSettings"
import { type RouteHandler } from "@/models/types/schemaTypeExtractor"
import {
	getProjectSettingsService,
	updateProjectSettingsService,
} from "@/services/projectSettings"

export const getProjectSettingsHandler: RouteHandler<
	typeof getProjectSettingsSchema
> = async (req, res) => {
	try {
		if (!req.userId) {
			await res.code(401).send({ error: "Unauthorized" })

			return
		}

		const settings = await getProjectSettingsService(
			req.params.projectId,
			req.userId,
		)

		if (settings === null) {
			await res.code(404).send({ error: "Project not found" })

			return
		}

		await res.code(200).send({ settings })
	} catch (err) {
		logger.error(err)
		await res.code(500).send({ error: "Internal Server Error" })
	}
}

export const updateProjectSettingsHandler: RouteHandler<
	typeof updateProjectSettingsSchema
> = async (req, res) => {
	try {
		if (!req.userId) {
			await res.code(401).send({ error: "Unauthorized" })

			return
		}

		const settings = await updateProjectSettingsService(
			req.params.projectId,
			req.userId,
			req.body,
		)

		if (settings === null) {
			await res.code(404).send({ error: "Project not found" })

			return
		}

		logger.info(
			{
				projectId: req.params.projectId,
			},
			"Project settings updated",
		)

		await res.code(200).send({ settings })
	} catch (err) {
		logger.error(err)
		await res.code(500).send({ error: "Internal Server Error" })
	}
}
