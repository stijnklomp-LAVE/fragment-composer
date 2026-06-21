import { Type } from "@sinclair/typebox"

const deviceBase = Type.Object({
	deviceName: Type.String({ maxLength: 100, minLength: 1 }),
})

const deviceSchema = Type.Intersect([
	deviceBase,
	Type.Object({
		createdAt: Type.String({ format: "date-time" }),
		deviceId: Type.String(),
		updatedAt: Type.String({ format: "date-time" }),
	}),
])

export const registerDeviceSchema = {
	body: deviceBase,
	response: {
		201: Type.Object({
			device: deviceSchema,
			message: Type.String(),
		}),
		500: { $ref: "HttpError" },
	},
}

export const getDevicesSchema = {
	response: {
		200: Type.Object({
			devices: Type.Array(deviceSchema),
		}),
		500: { $ref: "HttpError" },
	},
}

const deviceStatusSchema = Type.Object({
	lastContact: Type.String({ format: "date-time" }),
	state: Type.Union([
		Type.Literal("online"),
		Type.Literal("offline"),
		Type.Literal("stale"),
	]),
	status: Type.Union([Type.Literal("online"), Type.Literal("offline")]),
})

export const deviceHeartbeatSchema = {
	body: Type.Object({
		status: Type.Union([Type.Literal("online"), Type.Literal("offline")]),
	}),
	params: Type.Object({
		deviceId: Type.String({ minLength: 1 }),
	}),
	response: {
		200: Type.Object({
			message: Type.String(),
		}),
		500: { $ref: "HttpError" },
	},
}

export const getDeviceStatusSchema = {
	response: {
		200: Type.Object({
			devices: Type.Record(Type.String(), deviceStatusSchema),
		}),
		500: { $ref: "HttpError" },
	},
}
