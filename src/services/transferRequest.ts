import {
	createParticipantsRepo,
	updateParticipantStatusRepo,
	getParticipantStatusesForRequestRepo,
} from "@/repositories/participant"
import {
	createTransferRequestRepo,
	getTransferRequestByIdRepo,
	getTransferRequestsForUserRepo,
	updateTransferRequestStatusRepo,
} from "@/repositories/transferRequest"

export const getTransferRequestsForUserService = async (userId: string) =>
	getTransferRequestsForUserRepo(userId)

export const createTransferRequestService = async (data: {
	direction: "SEND" | "RECEIVE"
	fragmentIds?: string[]
	fragmentNames?: string[]
	message?: string
	projectId?: string
	projectName?: string
	sourceDeviceIds: string[]
	targetDeviceIds: string[]
	creatorDeviceId: string
}) => {
	const expiresAt = new Date(Date.now() + 30 * 60 * 1000)

	const request = await createTransferRequestRepo({
		direction: data.direction,
		expiresAt,
		fragmentIds: data.fragmentIds ?? [],
		fragmentNames: data.fragmentNames ?? [],
		message: data.message ?? null,
		projectId: data.projectId ?? null,
		projectName: data.projectName ?? null,
	})

	const participants: {
		transferRequestId: string
		deviceId: string
		role: "SOURCE" | "TARGET"
	}[] = []

	for (const sourceId of data.sourceDeviceIds) {
		participants.push({
			deviceId: sourceId,
			role: "SOURCE",
			transferRequestId: request.id,
		})
	}

	for (const targetId of data.targetDeviceIds) {
		participants.push({
			deviceId: targetId,
			role: "TARGET",
			transferRequestId: request.id,
		})
	}

	await createParticipantsRepo(participants)

	return getTransferRequestByIdRepo(request.id)
}

export const getTransferRequestByIdService = async (id: string) =>
	getTransferRequestByIdRepo(id)

export const respondToParticipantService = async (
	requestId: string,
	deviceId: string,
	action: "accept" | "reject",
) => {
	const participant = await updateParticipantStatusRepo(
		requestId,
		deviceId,
		action === "accept" ? "ACCEPTED" : "REJECTED",
	)

	if (!participant) return null

	// Check if all remaining participants have responded (accepted or rejected)
	const allParticipants =
		await getParticipantStatusesForRequestRepo(requestId)
	const remaining = allParticipants.filter(
		(p) => p.status === "PENDING" || p.status === "ACCEPTED",
	)

	// If all remaining participants are accepted, mark request as ACTIVE
	if (
		remaining.length > 0 &&
		remaining.every((p) => p.status === "ACCEPTED")
	) {
		await updateTransferRequestStatusRepo(requestId, "ACTIVE")
	}

	return participant
}

export const deleteTransferRequestService = async (requestId: string) =>
	updateTransferRequestStatusRepo(requestId, "DELETED")

export const expireTransferRequestService = async (requestId: string) =>
	updateTransferRequestStatusRepo(requestId, "EXPIRED")

export const cancelParticipantService = async (
	requestId: string,
	deviceId: string,
): Promise<{
	participant: {
		device: { deviceName: string }
		deviceId: string
		id: string
		role: "SOURCE" | "TARGET"
		status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED" | "COMPLETED"
	} | null
}> => {
	const result = await updateParticipantStatusRepo(
		requestId,
		deviceId,
		"CANCELLED",
	)

	return { participant: result }
}
