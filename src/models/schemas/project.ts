import { Type } from "@sinclair/typebox"

const fragmentSchema = Type.Object({
	createdAt: Type.String({ format: "date-time" }),
	duration: Type.Optional(Type.Number()),
	filePath: Type.String(),
	id: Type.String(),
	name: Type.String(),
	size: Type.Number(),
})

const projectSchema = Type.Object({
	createdAt: Type.String({ format: "date-time" }),
	description: Type.Union([Type.String(), Type.Null()]),
	fragmentCount: Type.Number(),
	fragments: Type.Optional(Type.Array(fragmentSchema)),
	id: Type.String(),
	name: Type.String(),
	updatedAt: Type.String({ format: "date-time" }),
})

const projectListItemSchema = Type.Object({
	createdAt: Type.String({ format: "date-time" }),
	description: Type.Union([Type.String(), Type.Null()]),
	fragmentCount: Type.Number(),
	id: Type.String(),
	name: Type.String(),
	updatedAt: Type.String({ format: "date-time" }),
})

const createProjectBodySchema = Type.Object({
	description: Type.Optional(Type.String({ maxLength: 500 })),
	name: Type.String({ maxLength: 200, minLength: 1 }),
})

const updateProjectBodySchema = Type.Object({
	description: Type.Optional(
		Type.Union([Type.String({ maxLength: 500 }), Type.Null()]),
	),
	name: Type.Optional(Type.String({ maxLength: 200, minLength: 1 })),
})

export const getProjectsSchema = {
	response: {
		200: Type.Object({
			projects: Type.Array(projectListItemSchema),
		}),
		500: { $ref: "HttpError" },
	},
}

export const getProjectsWithFragmentsSchema = {
	response: {
		200: Type.Object({
			projects: Type.Array(projectSchema),
		}),
		500: { $ref: "HttpError" },
	},
}

export const createProjectSchema = {
	body: createProjectBodySchema,
	response: {
		201: Type.Object({
			project: projectSchema,
		}),
		500: { $ref: "HttpError" },
	},
}

export const getProjectSchema = {
	params: Type.Object({
		projectId: Type.String(),
	}),
	response: {
		200: Type.Object({
			project: projectSchema,
		}),
		404: { $ref: "HttpError" },
		500: { $ref: "HttpError" },
	},
}

export const updateProjectSchema = {
	body: updateProjectBodySchema,
	params: Type.Object({
		projectId: Type.String(),
	}),
	response: {
		200: Type.Object({
			project: projectSchema,
		}),
		404: { $ref: "HttpError" },
		500: { $ref: "HttpError" },
	},
}

export const deleteProjectSchema = {
	params: Type.Object({
		projectId: Type.String(),
	}),
	response: {
		200: Type.Object({
			message: Type.String(),
		}),
		404: { $ref: "HttpError" },
		500: { $ref: "HttpError" },
	},
}
