import { type FastifyInstance } from "fastify"

import {
	initiateOfferHandler,
	getPendingOffersHandler,
	submitAnswerHandler,
	getAnswerHandler,
	submitIceCandidateHandler,
	getIceCandidatesHandler,
} from "@/controllers/signaling"
import {
	initiateOfferSchema,
	getPendingOffersSchema,
	submitAnswerSchema,
	getAnswerSchema,
	submitIceCandidateSchema,
	getIceCandidatesSchema,
} from "@/models/schemas/signaling"

export default (fastify: FastifyInstance) => {
	fastify.route({
		handler: initiateOfferHandler,
		method: "POST",
		schema: initiateOfferSchema,
		url: "/signaling/offer",
	})

	fastify.route({
		handler: getPendingOffersHandler,
		method: "GET",
		schema: getPendingOffersSchema,
		url: "/signaling/pending",
	})

	fastify.route({
		handler: submitAnswerHandler,
		method: "PUT",
		schema: submitAnswerSchema,
		url: "/signaling/:sessionId/answer",
	})

	fastify.route({
		handler: getAnswerHandler,
		method: "GET",
		schema: getAnswerSchema,
		url: "/signaling/:sessionId/answer",
	})

	fastify.route({
		handler: submitIceCandidateHandler,
		method: "POST",
		schema: submitIceCandidateSchema,
		url: "/signaling/:sessionId/ice",
	})

	fastify.route({
		handler: getIceCandidatesHandler,
		method: "GET",
		schema: getIceCandidatesSchema,
		url: "/signaling/:sessionId/ice",
	})
}
