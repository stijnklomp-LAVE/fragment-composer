import { prismaClient } from "@/common/prisma"

export type LayerData = {
	createdAt: Date
	id: string
	name: string
	projectId: string
	segments: SegmentData[]
	zIndex: number
}

export type SegmentData = {
	createdAt: Date
	fragmentId: string
	id: string
	inPoint: number
	name: string
	order: number
	outPoint: number
}

export const getTimelineRepo = async (
	projectId: string,
): Promise<LayerData[]> => {
	const layers = await prismaClient.timelineLayer.findMany({
		include: {
			segments: { orderBy: { order: "asc" } },
		},
		orderBy: { zIndex: "asc" },
		where: { projectId },
	})

	return layers.map((layer) => ({
		createdAt: layer.createdAt,
		id: layer.id,
		name: layer.name,
		projectId: layer.projectId,
		segments: layer.segments.map((seg) => ({
			createdAt: seg.createdAt,
			fragmentId: seg.fragmentId,
			id: seg.id,
			inPoint: seg.inPoint,
			name: seg.name,
			order: seg.order,
			outPoint: seg.outPoint,
		})),
		zIndex: layer.zIndex,
	}))
}

export const createLayerRepo = async (data: {
	projectId: string
	name: string
	zIndex: number
}): Promise<LayerData> => {
	const layer = await prismaClient.timelineLayer.create({
		data,
		include: {
			segments: { orderBy: { order: "asc" } },
		},
	})

	return {
		createdAt: layer.createdAt,
		id: layer.id,
		name: layer.name,
		projectId: layer.projectId,
		segments: [],
		zIndex: layer.zIndex,
	}
}

export const getMaxZIndexRepo = async (projectId: string): Promise<number> => {
	const result = await prismaClient.timelineLayer.aggregate({
		// eslint-disable-next-line @typescript-eslint/naming-convention
		_max: { zIndex: true },
		where: { projectId },
	})

	return result._max.zIndex ?? -1
}

export const getMaxOrderInLayerRepo = async (
	layerId: string,
): Promise<number> => {
	const result = await prismaClient.timelineSegment.aggregate({
		// eslint-disable-next-line @typescript-eslint/naming-convention
		_max: { order: true },
		where: { layerId },
	})

	return result._max.order ?? -1
}

export const createSegmentRepo = async (data: {
	layerId: string
	fragmentId: string
	name: string
	order: number
	inPoint: number
	outPoint: number
}): Promise<SegmentData> => {
	const segment = await prismaClient.timelineSegment.create({
		data,
	})

	return {
		createdAt: segment.createdAt,
		fragmentId: segment.fragmentId,
		id: segment.id,
		inPoint: segment.inPoint,
		name: segment.name,
		order: segment.order,
		outPoint: segment.outPoint,
	}
}

export const getFragmentByIdRepo = async (fragmentId: string) => {
	return prismaClient.fragment.findUnique({
		where: { id: fragmentId },
	})
}

export const getProjectByIdRepo = async (projectId: string) => {
	return prismaClient.videoProject.findUnique({
		where: { id: projectId },
	})
}

export const getLayerByIdRepo = async (layerId: string) => {
	return prismaClient.timelineLayer.findUnique({
		where: { id: layerId },
	})
}
