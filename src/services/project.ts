import {
	createProjectRepo,
	deleteProjectRepo,
	getProjectByIdRepo,
	getProjectsForOwnerRepo,
	getProjectsWithFragmentsForOwnerRepo,
	updateProjectRepo,
} from "@/repositories/project"

export const getProjectsForOwnerService = async (ownerId: string) =>
	getProjectsForOwnerRepo(ownerId)

export const getProjectsWithFragmentsForOwnerService = async (
	ownerId: string,
) => getProjectsWithFragmentsForOwnerRepo(ownerId)

export const createProjectService = async (data: {
	name: string
	description?: string
	ownerId: string
}) => createProjectRepo(data)

export const getProjectByIdService = async (
	projectId: string,
	ownerId: string,
) => {
	const project = await getProjectByIdRepo(projectId)

	if (!project?.ownerId || project.ownerId !== ownerId) {
		return null
	}

	return project
}

export const updateProjectService = async (
	projectId: string,
	ownerId: string,
	data: { name?: string; description?: string | null },
) => {
	const project = await getProjectByIdRepo(projectId)

	if (!project?.ownerId || project.ownerId !== ownerId) {
		return null
	}

	return updateProjectRepo(projectId, data)
}

export const deleteProjectService = async (
	projectId: string,
	ownerId: string,
) => {
	const project = await getProjectByIdRepo(projectId)

	if (!project?.ownerId || project.ownerId !== ownerId) {
		return null
	}

	await deleteProjectRepo(projectId)

	return true
}
