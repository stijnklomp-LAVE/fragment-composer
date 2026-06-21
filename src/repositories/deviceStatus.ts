import { cacheClient } from "@/infrastructure/cache"

const DEVICE_STATUS_TTL_SECONDS = 900

type DeviceStatusEntry = {
	lastContact: string
	status: "online" | "offline"
}

type OwnerStatusMap = Record<string, DeviceStatusEntry>

const buildKey = (owner: string) => `device_status:${owner}`

export const updateDeviceHeartbeatRepo = async (
	owner: string,
	deviceId: string,
	status: "online" | "offline",
) => {
	const key = buildKey(owner)
	const raw = await cacheClient.get(key)
	const entries: OwnerStatusMap = raw
		? (JSON.parse(raw) as OwnerStatusMap)
		: {}

	entries[deviceId] = {
		lastContact: new Date().toISOString(),
		status,
	}

	await cacheClient.setWithTTL(
		key,
		JSON.stringify(entries),
		DEVICE_STATUS_TTL_SECONDS,
	)
}

export const getDeviceStatusRepo = async (
	owner: string,
): Promise<OwnerStatusMap> => {
	const key = buildKey(owner)
	const raw = await cacheClient.get(key)

	if (!raw) return {}

	const parsed: OwnerStatusMap = JSON.parse(raw) as OwnerStatusMap

	return parsed
}
