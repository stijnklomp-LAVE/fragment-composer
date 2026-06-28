import { prismaClient } from "@/common/prisma"

export type FragmentData = {
	createdAt: Date
	duration: number | null
	filePath: string
	id: string
	name: string
	size: number
}

export const createFragmentRepo = async (data: {
	duration?: number | null
	filePath: string
	name: string
	projectId: string
	size: number
}): Promise<FragmentData> => {
	const fragment = await prismaClient.fragment.create({
		data,
	})

	return {
		createdAt: fragment.createdAt,
		duration: fragment.duration,
		filePath: fragment.filePath,
		id: fragment.id,
		name: fragment.name,
		size: fragment.size,
	}
}
