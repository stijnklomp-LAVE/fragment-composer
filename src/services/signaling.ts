import { type Static } from "@sinclair/typebox"
import { randomUUID } from "node:crypto"

import { initiateOfferSchema } from "@/models/schemas/signaling"
import {
	createSessionRepo,
	getSessionRepo,
	updateSessionRepo,
	getPendingSessionsRepo,
	removePendingSessionRepo,
	type SignalingSession,
} from "@/repositories/signaling"

export const initiateOfferService = async (
	data: Static<typeof initiateOfferSchema.body>,
) => {
	const sessionId = randomUUID()
	const now = new Date().toISOString()

	const session: SignalingSession = {
		answer: null,
		createdAt: now,
		offer: data.sdp,
		sessionId,
		sourceCandidates: [],
		sourceDeviceId: data.sourceDeviceId,
		targetCandidates: [],
		targetDeviceId: data.targetDeviceId,
	}

	await createSessionRepo(session)

	return { sessionId }
}

export const getPendingOffersService = async (deviceId: string) => {
	const sessions = await getPendingSessionsRepo(deviceId)

	return sessions.map((s) => ({
		answer: s.answer,
		offer: s.offer,
		sessionId: s.sessionId,
		sourceDeviceId: s.sourceDeviceId,
		targetDeviceId: s.targetDeviceId,
	}))
}

export const submitAnswerService = async (
	sessionId: string,
	sdp: string,
): Promise<boolean> => {
	const session = await getSessionRepo(sessionId)

	if (!session) return false

	session.answer = sdp

	await removePendingSessionRepo(session.targetDeviceId, sessionId)
	await updateSessionRepo(session)

	return true
}

export const getAnswerService = async (
	sessionId: string,
): Promise<string | null> => {
	const session = await getSessionRepo(sessionId)

	if (!session?.answer) return null

	return session.answer
}

export const submitIceCandidateService = async (
	sessionId: string,
	candidate: string,
	fromDeviceId: string,
	sdpMLineIndex?: number,
	sdpMid?: string,
): Promise<boolean> => {
	const session = await getSessionRepo(sessionId)

	if (!session) return false

	const entry = {
		candidate,
		fromDeviceId,
		...(sdpMLineIndex !== undefined ? { sdpMLineIndex } : {}),
		...(sdpMid !== undefined ? { sdpMid } : {}),
	}

	if (fromDeviceId === session.sourceDeviceId) {
		session.sourceCandidates.push(entry)
	} else {
		session.targetCandidates.push(entry)
	}

	await updateSessionRepo(session)

	return true
}

export const getIceCandidatesService = async (
	sessionId: string,
	fromDeviceId: string,
) => {
	const session = await getSessionRepo(sessionId)

	if (!session) return []

	const candidates =
		fromDeviceId === session.sourceDeviceId
			? session.targetCandidates
			: session.sourceCandidates

	return candidates
}
