import { type FastifyReply, type FastifyRequest } from "fastify"

import { logger } from "@/common/logger"
import { prismaClient } from "@/common/prisma"
import { queueClient } from "@/infrastructure/rabbitMQ"

export const processExpiredDeletionsHandler = async (
	_request: FastifyRequest,
	reply: FastifyReply,
) => {
	const users: { id: string }[] = await prismaClient.$queryRaw<
		{ id: string }[]
	>`SELECT id FROM "User" WHERE "deletionScheduledAt" <= NOW() AND "markedForDeletionAt" IS NOT NULL`

	if (users.length === 0) {
		return reply.status(200).send({ processed: 0 })
	}

	let published = 0

	for (const user of users) {
		const msg = JSON.stringify({
			type: "account-deletion",
			userId: user.id,
		})

		const success: boolean = await queueClient.publish(
			"worker",
			"main",
			"account.deletion",
			msg,
		)

		if (success) {
			published++
		} else {
			logger.error(
				{ userId: user.id },
				"Failed to publish account-deletion message",
			)
		}
	}

	return reply.status(200).send({ processed: published })
}
