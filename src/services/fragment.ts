import { createFragmentRepo } from "@/repositories/fragment"

export const createFragmentService = async (data: {
	duration?: number | null
	filePath: string
	name: string
	projectId: string
	size: number
}) => createFragmentRepo(data)
