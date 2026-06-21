import fp from "fastify-plugin"
import { jwtVerify } from "jose"

import { logger } from "@/common/logger"

const getSecret = () => {
	const secret = process.env.JWT_SECRET

	if (!secret) {
		throw new Error("JWT_SECRET environment variable is not defined")
	}

	return new TextEncoder().encode(secret)
}

export type JwtPayload = {
	sub: string
	email?: string
	exp: number
}

declare module "fastify" {
	// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
	interface FastifyRequest {
		userId?: string
	}
}

export default fp((fastify) => {
	fastify.decorateRequest("userId", undefined)

	fastify.addHook("onRequest", async (request, reply) => {
		const authHeader = request.headers.authorization

		if (!authHeader?.startsWith("Bearer ")) {
			await reply
				.code(401)
				.send({ error: "Missing or invalid authorization header" })

			return
		}

		const token = authHeader.slice(7)

		try {
			const { payload } = await jwtVerify(token, getSecret())
			const userId = payload.sub

			if (!userId) {
				await reply
					.code(401)
					.send({ error: "Invalid token: no subject" })

				return
			}

			request.userId = userId
		} catch (err) {
			logger.error(err)
			await reply.code(401).send({ error: "Invalid or expired token" })
		}
	})
})
