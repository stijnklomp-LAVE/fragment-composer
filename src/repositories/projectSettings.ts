import { prismaClient } from "@/common/prisma"

export const getProjectSettingsRepo = async (projectId: string) => {
	const project = await prismaClient.videoProject.findUnique({
		select: { settings: true },
		where: { id: projectId },
	})

	if (!project) return null

	return (project.settings as Record<string, unknown> | null) ?? {}
}

export const updateProjectSettingsRepo = async (
	projectId: string,
	settings: Record<string, unknown>,
) => {
	const project = await prismaClient.videoProject.update({
		// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
		data: { settings } as any,
		select: { settings: true },
		where: { id: projectId },
	})

	return (project.settings as Record<string, unknown> | null) ?? {}
}
