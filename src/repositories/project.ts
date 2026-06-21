import { prismaClient } from "@/common/prisma"

type FragmentData = {
	createdAt: Date
	duration: number | null
	filePath: string
	id: string
	name: string
	size: number
}

type ProjectWithCount = {
	createdAt: Date
	description: string | null
	fragmentCount: number
	fragments?: FragmentData[]
	id: string
	name: string
	ownerId: string
	updatedAt: Date
}

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProject(project: any): ProjectWithCount {
	return {
		createdAt: project.createdAt,
		description: project.description,
		fragmentCount: project._count?.fragments ?? 0,
		fragments: project.fragments,
		id: project.id,
		name: project.name,
		ownerId: project.ownerId,
		updatedAt: project.updatedAt,
	}
}
/* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

export const getProjectsForOwnerRepo = async (ownerId: string) => {
	const projects = await prismaClient().videoProject.findMany({
		// eslint-disable-next-line @typescript-eslint/naming-convention
		include: { _count: { select: { fragments: true } } },
		orderBy: { updatedAt: "desc" },
		where: { ownerId },
	})

	return projects.map(mapProject)
}

export const getProjectsWithFragmentsForOwnerRepo = async (ownerId: string) => {
	const projects = await prismaClient().videoProject.findMany({
		// eslint-disable-next-line @typescript-eslint/naming-convention
		include: { _count: { select: { fragments: true } }, fragments: true },
		orderBy: { updatedAt: "desc" },
		where: { ownerId },
	})

	return projects.map(mapProject)
}

export const createProjectRepo = async (data: {
	name: string
	description?: string
	ownerId: string
}) => {
	const { ownerId, ...rest } = data

	const project = await prismaClient().videoProject.create({
		data: {
			...rest,
			owner: { connect: { id: ownerId } },
		},
		// eslint-disable-next-line @typescript-eslint/naming-convention
		include: { _count: { select: { fragments: true } } },
	})

	return mapProject(project)
}

export const getProjectByIdRepo = async (projectId: string) => {
	const project = await prismaClient().videoProject.findUnique({
		// eslint-disable-next-line @typescript-eslint/naming-convention
		include: { _count: { select: { fragments: true } }, fragments: true },
		where: { id: projectId },
	})

	if (!project) return null

	return mapProject(project)
}

export const updateProjectRepo = async (
	projectId: string,
	data: { name?: string; description?: string | null },
) => {
	const project = await prismaClient().videoProject.update({
		data,
		// eslint-disable-next-line @typescript-eslint/naming-convention
		include: { _count: { select: { fragments: true } } },
		where: { id: projectId },
	})

	return mapProject(project)
}

export const deleteProjectRepo = async (projectId: string) =>
	prismaClient().videoProject.delete({ where: { id: projectId } })
