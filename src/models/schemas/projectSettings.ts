import { Type } from "@sinclair/typebox"

const projectSettingsSchema = Type.Object({
	duration: Type.Optional(Type.Number()),
	fps: Type.Optional(Type.Number()),
	imageFormat: Type.Optional(Type.String()),
	jpegQuality: Type.Optional(Type.Number()),
})

const getProjectSettingsResponseSchema = Type.Object({
	settings: projectSettingsSchema,
})

const updateProjectSettingsBodySchema = Type.Object({
	duration: Type.Optional(Type.Number()),
	fps: Type.Optional(Type.Number()),
	imageFormat: Type.Optional(Type.String()),
	jpegQuality: Type.Optional(Type.Number()),
})

export const getProjectSettingsSchema = {
	params: Type.Object({
		projectId: Type.String(),
	}),
	response: {
		200: getProjectSettingsResponseSchema,
		404: { $ref: "HttpError" },
		500: { $ref: "HttpError" },
	},
}

export const updateProjectSettingsSchema = {
	body: updateProjectSettingsBodySchema,
	params: Type.Object({
		projectId: Type.String(),
	}),
	response: {
		200: getProjectSettingsResponseSchema,
		404: { $ref: "HttpError" },
		500: { $ref: "HttpError" },
	},
}
