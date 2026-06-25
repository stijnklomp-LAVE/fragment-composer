import {
	getDeviceFragmentsForOwnerRepo,
	replaceDeviceFragmentsRepo,
} from "@/repositories/deviceFragment"

export const getDeviceFragmentsForOwnerService = async (ownerId: string) =>
	getDeviceFragmentsForOwnerRepo(ownerId)

export const setDeviceFragmentsService = async (
	deviceId: string,
	fragmentIds: string[],
) => {
	await replaceDeviceFragmentsRepo(deviceId, fragmentIds)
}
