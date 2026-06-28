import {
	createLayerRepo,
	createSegmentRepo,
	getFragmentByIdRepo,
	getLayerByIdRepo,
	getMaxOrderInLayerRepo,
	getMaxZIndexRepo,
	getProjectByIdRepo,
	getTimelineRepo,
	type LayerData,
	type SegmentData,
} from "@/repositories/timeline"

export const getTimelineService = async (
	projectId: string,
	ownerId: string,
): Promise<LayerData[] | null> => {
	const project = await getProjectByIdRepo(projectId)

	if (project?.ownerId !== ownerId) {
		return null
	}

	return getTimelineRepo(projectId)
}

export const createLayerService = async (data: {
	projectId: string
	ownerId: string
}): Promise<LayerData | null> => {
	const project = await getProjectByIdRepo(data.projectId)

	if (project?.ownerId !== data.ownerId) {
		return null
	}

	const nextZIndex = (await getMaxZIndexRepo(data.projectId)) + 1

	const layer = await createLayerRepo({
		name: `Layer ${String(nextZIndex + 1)}`,
		projectId: data.projectId,
		zIndex: nextZIndex,
	})

	return layer
}

export const createSegmentService = async (data: {
	fragmentId: string
	layerId: string
	name?: string
	ownerId: string
}): Promise<SegmentData | null> => {
	const layer = await getLayerByIdRepo(data.layerId)

	if (!layer) return null

	// Verify ownership through the project
	const project = await getProjectByIdRepo(layer.projectId)

	if (project?.ownerId !== data.ownerId) {
		return null
	}

	const fragment = await getFragmentByIdRepo(data.fragmentId)

	if (!fragment) return null

	const nextOrder = (await getMaxOrderInLayerRepo(data.layerId)) + 1

	const segment = await createSegmentRepo({
		fragmentId: data.fragmentId,
		inPoint: 0,
		layerId: data.layerId,
		name: data.name ?? fragment.name,
		order: nextOrder,
		outPoint: fragment.duration ?? 0,
	})

	return segment
}
