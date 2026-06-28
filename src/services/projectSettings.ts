import { getProjectByIdRepo } from "@/repositories/project"
import {
	getProjectSettingsRepo,
	updateProjectSettingsRepo,
} from "@/repositories/projectSettings"

export const getProjectSettingsService = async (
	projectId: string,
	ownerId: string,
) => {
	const project = await getProjectByIdRepo(projectId)

	if (!project?.ownerId || project.ownerId !== ownerId) {
		return null
	}

	return getProjectSettingsRepo(projectId)
}

export const updateProjectSettingsService = async (
	projectId: string,
	ownerId: string,
	settings: Record<string, unknown>,
) => {
	const project = await getProjectByIdRepo(projectId)

	if (!project?.ownerId || project.ownerId !== ownerId) {
		return null
	}

	return updateProjectSettingsRepo(projectId, settings)
}
