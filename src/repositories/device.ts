import { prismaClient } from "@/common/prisma"

type RegisterInput = {
	deviceName: string
	ownerId: string
}

export const registerDeviceRepo = async (data: RegisterInput) => {
	const { ownerId, ...rest } = data

	return prismaClient.device.create({
		data: {
			...rest,
			owner: { connect: { id: ownerId } },
		},
	})
}

export const getDevicesForOwnerRepo = async (ownerId: string) =>
	prismaClient.device.findMany({ where: { ownerId } })

export const getDeviceByIdRepo = async (deviceId: string) =>
	prismaClient.device.findUnique({ where: { deviceId } })
