import { Type } from "@sinclair/typebox"

const segmentSchema = Type.Object({
	createdAt: Type.String({ format: "date-time" }),
	fragmentId: Type.String(),
	id: Type.String(),
	inPoint: Type.Number(),
	name: Type.String(),
	order: Type.Number(),
	outPoint: Type.Number(),
})

const layerSchema = Type.Object({
	createdAt: Type.String({ format: "date-time" }),
	id: Type.String(),
	name: Type.String(),
	projectId: Type.String(),
	segments: Type.Array(segmentSchema),
	zIndex: Type.Number(),
})

const timelineSchema = Type.Object({
	layers: Type.Array(layerSchema),
})

const createLayerBodySchema = Type.Object({
	fragmentId: Type.Optional(Type.String()),
})

const createSegmentBodySchema = Type.Object({
	fragmentId: Type.String({ minLength: 1 }),
	name: Type.Optional(Type.String({ maxLength: 200 })),
})

export const getTimelineSchema = {
	params: Type.Object({
		projectId: Type.String(),
	}),
	response: {
		200: timelineSchema,
		404: { $ref: "HttpError" },
		500: { $ref: "HttpError" },
	},
}

export const createLayerSchema = {
	body: createLayerBodySchema,
	params: Type.Object({
		projectId: Type.String(),
	}),
	response: {
		201: Type.Object({
			layer: layerSchema,
		}),
		404: { $ref: "HttpError" },
		500: { $ref: "HttpError" },
	},
}

export const createSegmentSchema = {
	body: createSegmentBodySchema,
	params: Type.Object({
		layerId: Type.String(),
		projectId: Type.String(),
	}),
	response: {
		201: Type.Object({
			segment: segmentSchema,
		}),
		404: { $ref: "HttpError" },
		500: { $ref: "HttpError" },
	},
}
