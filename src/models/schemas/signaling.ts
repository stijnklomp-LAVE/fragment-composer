import { Type } from "@sinclair/typebox"

const sdpSchema = Type.String({ minLength: 1 })

const iceCandidateSchema = Type.Object({
	candidate: Type.String(),
	fromDeviceId: Type.String({ minLength: 1 }),
	sdpMLineIndex: Type.Optional(Type.Number()),
	sdpMid: Type.Optional(Type.String()),
})

const sessionSchema = Type.Object({
	answer: Type.Union([sdpSchema, Type.Null()]),
	offer: Type.Union([sdpSchema, Type.Null()]),
	sessionId: Type.String({ format: "uuid" }),
	sourceDeviceId: Type.String({ minLength: 1 }),
	targetDeviceId: Type.String({ minLength: 1 }),
})

export const initiateOfferSchema = {
	body: Type.Object({
		sdp: sdpSchema,
		sourceDeviceId: Type.String({ minLength: 1 }),
		targetDeviceId: Type.String({ minLength: 1 }),
	}),
	response: {
		201: Type.Object({
			sessionId: Type.String({ format: "uuid" }),
		}),
		500: { $ref: "HttpError" },
	},
}

export const getPendingOffersSchema = {
	querystring: Type.Object({
		deviceId: Type.String({ minLength: 1 }),
	}),
	response: {
		200: Type.Object({
			sessions: Type.Array(sessionSchema),
		}),
		500: { $ref: "HttpError" },
	},
}

export const submitAnswerSchema = {
	body: Type.Object({
		sdp: sdpSchema,
	}),
	params: Type.Object({
		sessionId: Type.String({ format: "uuid" }),
	}),
	response: {
		200: Type.Object({
			message: Type.String(),
		}),
		404: { $ref: "HttpError" },
		500: { $ref: "HttpError" },
	},
}

export const getAnswerSchema = {
	params: Type.Object({
		sessionId: Type.String({ format: "uuid" }),
	}),
	response: {
		200: Type.Object({
			answer: sdpSchema,
		}),
		404: { $ref: "HttpError" },
		500: { $ref: "HttpError" },
	},
}

export const submitIceCandidateSchema = {
	body: iceCandidateSchema,
	params: Type.Object({
		sessionId: Type.String({ format: "uuid" }),
	}),
	response: {
		200: Type.Object({
			message: Type.String(),
		}),
		500: { $ref: "HttpError" },
	},
}

export const getIceCandidatesSchema = {
	params: Type.Object({
		sessionId: Type.String({ format: "uuid" }),
	}),
	querystring: Type.Object({
		fromDeviceId: Type.String({ minLength: 1 }),
	}),
	response: {
		200: Type.Object({
			candidates: Type.Array(iceCandidateSchema),
		}),
		500: { $ref: "HttpError" },
	},
}
