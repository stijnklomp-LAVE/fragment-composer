import { cacheClient } from "@/infrastructure/cache"

type IceCandidate = {
	candidate: string
	fromDeviceId: string
	sdpMLineIndex?: number
	sdpMid?: string
}

export type SignalingSession = {
	sessionId: string
	sourceDeviceId: string
	targetDeviceId: string
	offer: string | null
	answer: string | null
	sourceCandidates: IceCandidate[]
	targetCandidates: IceCandidate[]
	createdAt: string
}

const sessionKey = (sessionId: string) => `signaling:${sessionId}`

const pendingKey = (deviceId: string) => `signaling_pending:${deviceId}`

export const createSessionRepo = async (
	session: SignalingSession,
): Promise<void> => {
	const raw = await cacheClient.get(pendingKey(session.targetDeviceId))
	const pending: string[] = raw ? (JSON.parse(raw) as string[]) : []

	pending.push(session.sessionId)

	await cacheClient.setWithTTL(
		sessionKey(session.sessionId),
		JSON.stringify(session),
		1800,
	)
	await cacheClient.setWithTTL(
		pendingKey(session.targetDeviceId),
		JSON.stringify(pending),
		1800,
	)
}

export const getSessionRepo = async (
	sessionId: string,
): Promise<SignalingSession | null> => {
	const raw = await cacheClient.get(sessionKey(sessionId))

	if (!raw) return null

	return JSON.parse(raw) as SignalingSession
}

export const updateSessionRepo = async (
	session: SignalingSession,
): Promise<void> => {
	await cacheClient.setWithTTL(
		sessionKey(session.sessionId),
		JSON.stringify(session),
		1800,
	)
}

export const getPendingSessionsRepo = async (
	deviceId: string,
): Promise<SignalingSession[]> => {
	const raw = await cacheClient.get(pendingKey(deviceId))

	if (!raw) return []

	const sessionIds: string[] = JSON.parse(raw) as string[]
	const sessions: SignalingSession[] = []

	for (const id of sessionIds) {
		const session = await getSessionRepo(id)

		if (session) {
			sessions.push(session)
		}
	}

	return sessions
}

export const removePendingSessionRepo = async (
	deviceId: string,
	sessionId: string,
): Promise<void> => {
	const raw = await cacheClient.get(pendingKey(deviceId))

	if (!raw) return

	const pending: string[] = JSON.parse(raw) as string[]
	const filtered = pending.filter((id) => id !== sessionId)

	if (filtered.length > 0) {
		await cacheClient.setWithTTL(
			pendingKey(deviceId),
			JSON.stringify(filtered),
			1800,
		)
	} else {
		await cacheClient.del(pendingKey(deviceId))
	}
}
