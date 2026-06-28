import { Type } from "@sinclair/typebox"

const fragmentSchema = Type.Object({
	createdAt: Type.String({ format: "date-time" }),
	duration: Type.Optional(Type.Number()),
	filePath: Type.String(),
	id: Type.String(),
	name: Type.String(),
	size: Type.Number(),
})

const createFragmentBodySchema = Type.Object({
	duration: Type.Optional(Type.Number({ minimum: 0 })),
	filePath: Type.String({ minLength: 1 }),
	name: Type.String({ maxLength: 200, minLength: 1 }),
	size: Type.Number({ minimum: 0 }),
})

export const createFragmentSchema = {
	body: createFragmentBodySchema,
	params: Type.Object({
		projectId: Type.String(),
	}),
	response: {
		201: Type.Object({
			fragment: fragmentSchema,
		}),
		404: { $ref: "HttpError" },
		500: { $ref: "HttpError" },
	},
}
