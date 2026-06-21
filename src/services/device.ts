import { type Static } from "@sinclair/typebox"

import { registerDeviceSchema } from "@/models/schemas/device"
import {
	registerDeviceRepo,
	getDevicesForOwnerRepo,
	getDeviceByIdRepo,
} from "@/repositories/device"
import {
	updateDeviceHeartbeatRepo,
	getDeviceStatusRepo,
} from "@/repositories/deviceStatus"

const STALE_THRESHOLD_MS =
	(Number(process.env.STALE_THRESHOLD_SECONDS) || 120) * 1000

type RegisterInput = Static<typeof registerDeviceSchema.body> & {
	ownerId: string
}

export const registerDeviceService = async (data: RegisterInput) =>
	registerDeviceRepo(data)

export const getDevicesForOwnerService = async (ownerId: string) =>
	getDevicesForOwnerRepo(ownerId)

export const getDeviceByIdService = async (deviceId: string) =>
	getDeviceByIdRepo(deviceId)

export const updateDeviceHeartbeatService = async (
	ownerId: string,
	deviceId: string,
	status: "online" | "offline",
) => {
	await updateDeviceHeartbeatRepo(ownerId, deviceId, status)
}

export const getDeviceStatusService = async (ownerId: string) => {
	const entries = await getDeviceStatusRepo(ownerId)
	const now = Date.now()

	const devices: Record<
		string,
		{
			lastContact: string
			state: "online" | "offline" | "stale"
			status: "online" | "offline"
		}
	> = {}

	for (const [deviceId, entry] of Object.entries(entries)) {
		const lastContactMs = new Date(entry.lastContact).getTime()
		const age = now - lastContactMs

		let state: "online" | "offline" | "stale"

		if (entry.status === "offline") {
			state = "offline"
		} else if (age > STALE_THRESHOLD_MS) {
			state = "stale"
		} else {
			state = "online"
		}

		devices[deviceId] = {
			lastContact: entry.lastContact,
			state,
			status: entry.status,
		}
	}

	return devices
}
