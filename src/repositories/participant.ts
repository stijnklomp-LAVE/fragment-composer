import { prismaClient } from "@/common/prisma"

export const createParticipantsRepo = async (
	participants: {
		transferRequestId: string
		deviceId: string
		role: "SOURCE" | "TARGET"
	}[],
) => {
	for (const p of participants) {
		await prismaClient.transferRequestParticipant.create({ data: p })
	}
}

export const updateParticipantStatusRepo = async (
	id: string,
	deviceId: string,
	status: "ACCEPTED" | "REJECTED" | "CANCELLED" | "COMPLETED",
) => {
	const participant = await prismaClient.transferRequestParticipant.findFirst(
		{
			where: { deviceId, transferRequestId: id },
		},
	)

	if (!participant) return null

	return prismaClient.transferRequestParticipant.update({
		data: { status },
		include: { device: { select: { deviceName: true } } },
		where: { id: participant.id },
	})
}

export const getParticipantStatusesForRequestRepo = async (
	transferRequestId: string,
) =>
	prismaClient.transferRequestParticipant.findMany({
		where: { transferRequestId },
	})
