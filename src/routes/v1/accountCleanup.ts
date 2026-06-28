import { type FastifyInstance } from "fastify"

import { processExpiredDeletionsHandler } from "@/controllers/accountCleanup"

export default (fastify: FastifyInstance) => {
	fastify.route({
		handler: processExpiredDeletionsHandler,
		method: "POST",
		url: "/internal/account-cleanup/process-expired",
	})
}
