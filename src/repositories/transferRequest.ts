import { prismaClient } from "@/common/prisma"

export const getTransferRequestsForUserRepo = async (userId: string) => {
	const userDevices = await prismaClient.device.findMany({
		select: { deviceId: true },
		where: { ownerId: userId },
	})

	const deviceIds = userDevices.map((d) => d.deviceId)

	return prismaClient.transferRequest.findMany({
		include: {
			participants: {
				include: { device: { select: { deviceName: true } } },
			},
		},
		orderBy: { createdAt: "desc" },
		where: {
			participants: {
				some: { deviceId: { in: deviceIds } },
			},
		},
	})
}

export const createTransferRequestRepo = async (data: {
	direction: "SEND" | "RECEIVE"
	expiresAt: Date
	fragmentIds: string[]
	fragmentNames: string[]
	message: string | null
	projectId: string | null
	projectName: string | null
}) =>
	prismaClient.transferRequest.create({
		data,
	})

export const getTransferRequestByIdRepo = async (id: string) =>
	prismaClient.transferRequest.findUnique({
		include: {
			participants: {
				include: {
					device: { select: { deviceName: true, ownerId: true } },
				},
			},
		},
		where: { id },
	})

export const updateTransferRequestStatusRepo = async (
	id: string,
	status: "ACTIVE" | "COMPLETED" | "DELETED" | "EXPIRED",
) =>
	prismaClient.transferRequest.update({
		data: { status },
		include: {
			participants: {
				include: { device: { select: { deviceName: true } } },
			},
		},
		where: { id },
	})
