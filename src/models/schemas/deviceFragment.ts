import { Type } from "@sinclair/typebox"

const deviceFragmentEntrySchema = Type.Object({
	fragmentId: Type.String(),
	projectId: Type.String(),
})

export const getDeviceFragmentsSchema = {
	response: {
		200: Type.Object({
			deviceFragments: Type.Record(
				Type.String(),
				Type.Array(deviceFragmentEntrySchema),
			),
		}),
		500: { $ref: "HttpError" },
	},
}

export const setDeviceFragmentsSchema = {
	body: Type.Object({
		fragmentIds: Type.Array(Type.String()),
	}),
	params: Type.Object({
		deviceId: Type.String({ minLength: 1 }),
	}),
	response: {
		200: Type.Object({
			message: Type.String(),
		}),
		401: { $ref: "HttpError" },
		404: { $ref: "HttpError" },
		500: { $ref: "HttpError" },
	},
}
