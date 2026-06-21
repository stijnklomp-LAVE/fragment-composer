import { logger } from "@/common/logger"
import {
	createProjectSchema,
	deleteProjectSchema,
	getProjectSchema,
	getProjectsSchema,
	getProjectsWithFragmentsSchema,
	updateProjectSchema,
} from "@/models/schemas/project"
import {
	createProjectService,
	deleteProjectService,
	getProjectByIdService,
	getProjectsForOwnerService,
	getProjectsWithFragmentsForOwnerService,
	updateProjectService,
} from "@/services/project"
import { type RouteHandler } from "@/models/types/schemaTypeExtractor"

export const getProjectsHandler: RouteHandler<
	typeof getProjectsSchema
> = async (req, res) => {
	try {
		if (!req.userId) {
			await res.code(401).send({ error: "Unauthorized" })

			return
		}

		const projects = await getProjectsForOwnerService(req.userId)

		await res.code(200).send({ projects })
	} catch (err) {
		logger.error(err)
		await res.code(500).send({ error: "Internal Server Error" })
	}
}

export const getProjectsWithFragmentsHandler: RouteHandler<
	typeof getProjectsWithFragmentsSchema
> = async (req, res) => {
	try {
		if (!req.userId) {
			await res.code(401).send({ error: "Unauthorized" })

			return
		}

		const projects = await getProjectsWithFragmentsForOwnerService(
			req.userId,
		)

		await res.code(200).send({ projects })
	} catch (err) {
		logger.error(err)
		await res.code(500).send({ error: "Internal Server Error" })
	}
}

export const createProjectHandler: RouteHandler<
	typeof createProjectSchema
> = async (req, res) => {
	try {
		if (!req.userId) {
			await res.code(401).send({ error: "Unauthorized" })

			return
		}

		const project = await createProjectService({
			...req.body,
			ownerId: req.userId,
		})

		logger.info(
			{
				projectId: project.id,
				projectName: project.name,
			},
			"Project created",
		)

		await res.code(201).send({ project })
	} catch (err) {
		logger.error(err)
		await res.code(500).send({ error: "Internal Server Error" })
	}
}

export const getProjectHandler: RouteHandler<typeof getProjectSchema> = async (
	req,
	res,
) => {
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

		await res.code(200).send({ project })
	} catch (err) {
		logger.error(err)
		await res.code(500).send({ error: "Internal Server Error" })
	}
}

export const updateProjectHandler: RouteHandler<
	typeof updateProjectSchema
> = async (req, res) => {
	try {
		if (!req.userId) {
			await res.code(401).send({ error: "Unauthorized" })

			return
		}

		const project = await updateProjectService(
			req.params.projectId,
			req.userId,
			req.body,
		)

		if (!project) {
			await res.code(404).send({ error: "Project not found" })

			return
		}

		await res.code(200).send({ project })
	} catch (err) {
		logger.error(err)
		await res.code(500).send({ error: "Internal Server Error" })
	}
}

export const deleteProjectHandler: RouteHandler<
	typeof deleteProjectSchema
> = async (req, res) => {
	try {
		if (!req.userId) {
			await res.code(401).send({ error: "Unauthorized" })

			return
		}

		const deleted = await deleteProjectService(
			req.params.projectId,
			req.userId,
		)

		if (!deleted) {
			await res.code(404).send({ error: "Project not found" })

			return
		}

		await res.code(200).send({ message: "Project deleted" })
	} catch (err) {
		logger.error(err)
		await res.code(500).send({ error: "Internal Server Error" })
	}
}
