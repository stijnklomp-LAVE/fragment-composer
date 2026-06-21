import { Type } from "@sinclair/typebox"

const participantSchema = Type.Object({
	deviceId: Type.String(),
	deviceName: Type.String(),
	role: Type.Union([Type.Literal("SOURCE"), Type.Literal("TARGET")]),
	status: Type.Union([
		Type.Literal("PENDING"),
		Type.Literal("ACCEPTED"),
		Type.Literal("REJECTED"),
		Type.Literal("CANCELLED"),
		Type.Literal("COMPLETED"),
	]),
})

const transferRequestSchema = Type.Object({
	createdAt: Type.String({ format: "date-time" }),
	direction: Type.Union([Type.Literal("SEND"), Type.Literal("RECEIVE")]),
	expiresAt: Type.String({ format: "date-time" }),
	fragmentIds: Type.Array(Type.String()),
	fragmentNames: Type.Array(Type.String()),
	id: Type.String(),
	message: Type.Union([Type.String(), Type.Null()]),
	participants: Type.Array(participantSchema),
	projectId: Type.Union([Type.String(), Type.Null()]),
	projectName: Type.Union([Type.String(), Type.Null()]),
	status: Type.Union([
		Type.Literal("PENDING"),
		Type.Literal("ACTIVE"),
		Type.Literal("COMPLETED"),
		Type.Literal("DELETED"),
		Type.Literal("EXPIRED"),
	]),
})

export const getTransferRequestsSchema = {
	response: {
		200: Type.Object({
			requests: Type.Array(transferRequestSchema),
		}),
		500: { $ref: "HttpError" },
	},
}

export const createTransferRequestSchema = {
	body: Type.Object({
		direction: Type.Union([Type.Literal("SEND"), Type.Literal("RECEIVE")]),
		fragmentIds: Type.Optional(Type.Array(Type.String())),
		fragmentNames: Type.Optional(Type.Array(Type.String())),
		message: Type.Optional(Type.String()),
		projectId: Type.Optional(Type.String()),
		projectName: Type.Optional(Type.String()),
		sourceDeviceIds: Type.Array(Type.String({ minLength: 1 })),
		targetDeviceIds: Type.Array(Type.String({ minLength: 1 })),
	}),
	response: {
		201: Type.Object({
			request: transferRequestSchema,
		}),
		400: { $ref: "HttpError" },
		500: { $ref: "HttpError" },
	},
}

export const respondToTransferRequestSchema = {
	body: Type.Object({
		action: Type.Union([Type.Literal("accept"), Type.Literal("reject")]),
	}),
	params: Type.Object({
		deviceId: Type.String({ minLength: 1 }),
		id: Type.String(),
	}),
	response: {
		200: Type.Object({
			participant: participantSchema,
		}),
		400: { $ref: "HttpError" },
		401: { $ref: "HttpError" },
		404: { $ref: "HttpError" },
		500: { $ref: "HttpError" },
	},
}

export const deleteTransferRequestSchema = {
	params: Type.Object({
		id: Type.String(),
	}),
	response: {
		200: Type.Object({
			message: Type.String(),
		}),
		400: { $ref: "HttpError" },
		401: { $ref: "HttpError" },
		404: { $ref: "HttpError" },
		500: { $ref: "HttpError" },
	},
}

export const cancelParticipantSchema = {
	params: Type.Object({
		deviceId: Type.String({ minLength: 1 }),
		id: Type.String(),
	}),
	response: {
		200: Type.Object({
			participant: participantSchema,
		}),
		400: { $ref: "HttpError" },
		401: { $ref: "HttpError" },
		404: { $ref: "HttpError" },
		500: { $ref: "HttpError" },
	},
}
