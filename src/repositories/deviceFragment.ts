import { prismaClient } from "@/common/prisma"

type DeviceFragmentEntry = {
	fragmentId: string
	updatedAt: string
	updaterDeviceId: string | null
}

export const getDeviceFragmentsForOwnerRepo = async (ownerId: string) => {
	const devices = await prismaClient.device.findMany({
		include: { deviceFragments: true },
		where: { ownerId },
	})

	const result: Record<string, DeviceFragmentEntry[]> = {}

	for (const device of devices) {
		result[device.deviceId] = device.deviceFragments.map((df) => ({
			fragmentId: df.fragmentId,
			updatedAt: df.updatedAt.toISOString(),
			updaterDeviceId: df.updaterDeviceId,
		}))
	}

	return result
}

export const replaceDeviceFragmentsRepo = async (
	deviceId: string,
	fragmentIds: string[],
) => {
	await prismaClient.$transaction(async (tx) => {
		const existingFragmentIds = new Set(
			(
				await tx.deviceFragment.findMany({
					select: { fragmentId: true },
					where: { deviceId },
				})
			).map((df) => df.fragmentId),
		)

		await tx.deviceFragment.deleteMany({ where: { deviceId } })

		if (fragmentIds.length > 0) {
			await tx.deviceFragment.createMany({
				data: fragmentIds.map((fragmentId) => ({
					deviceId,
					fragmentId,
					updatedAt: new Date(),
					updaterDeviceId: existingFragmentIds.has(fragmentId)
						? deviceId
						: null,
				})),
			})
		}
	})
}
