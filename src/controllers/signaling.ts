import { logger } from "@/common/logger"
import {
	initiateOfferSchema,
	getPendingOffersSchema,
	submitAnswerSchema,
	getAnswerSchema,
	submitIceCandidateSchema,
	getIceCandidatesSchema,
} from "@/models/schemas/signaling"
import {
	initiateOfferService,
	getPendingOffersService,
	submitAnswerService,
	getAnswerService,
	submitIceCandidateService,
	getIceCandidatesService,
} from "@/services/signaling"
import { type RouteHandler } from "@/models/types/schemaTypeExtractor"

export const initiateOfferHandler: RouteHandler<
	typeof initiateOfferSchema
> = async (req, res) => {
	try {
		const { sessionId } = await initiateOfferService({ ...req.body })

		logger.info(
			{
				sessionId,
				sourceDeviceId: req.body.sourceDeviceId,
				targetDeviceId: req.body.targetDeviceId,
			},
			"WebRTC offer initiated",
		)

		await res.code(201).send({ sessionId })
	} catch (err) {
		logger.error(err)
		await res.code(500).send({ error: "Internal Server Error" })
	}
}

export const getPendingOffersHandler: RouteHandler<
	typeof getPendingOffersSchema
> = async (req, res) => {
	try {
		const sessions = await getPendingOffersService(req.query.deviceId)

		await res.code(200).send({ sessions })
	} catch (err) {
		logger.error(err)
		await res.code(500).send({ error: "Internal Server Error" })
	}
}

export const submitAnswerHandler: RouteHandler<
	typeof submitAnswerSchema
> = async (req, res) => {
	try {
		const found = await submitAnswerService(
			req.params.sessionId,
			req.body.sdp,
		)

		if (!found) {
			await res.code(404).send({ error: "Session not found" })

			return
		}

		logger.info(
			{ sessionId: req.params.sessionId },
			"WebRTC answer submitted",
		)

		await res.code(200).send({ message: "Answer submitted" })
	} catch (err) {
		logger.error(err)
		await res.code(500).send({ error: "Internal Server Error" })
	}
}

export const getAnswerHandler: RouteHandler<typeof getAnswerSchema> = async (
	req,
	res,
) => {
	try {
		const answer = await getAnswerService(req.params.sessionId)

		if (!answer) {
			await res.code(404).send({ error: "Answer not found" })

			return
		}

		await res.code(200).send({ answer })
	} catch (err) {
		logger.error(err)
		await res.code(500).send({ error: "Internal Server Error" })
	}
}

export const submitIceCandidateHandler: RouteHandler<
	typeof submitIceCandidateSchema
> = async (req, res) => {
	try {
		await submitIceCandidateService(
			req.params.sessionId,
			req.body.candidate,
			req.body.fromDeviceId,
			req.body.sdpMLineIndex,
			req.body.sdpMid,
		)

		await res.code(200).send({ message: "ICE candidate recorded" })
	} catch (err) {
		logger.error(err)
		await res.code(500).send({ error: "Internal Server Error" })
	}
}

export const getIceCandidatesHandler: RouteHandler<
	typeof getIceCandidatesSchema
> = async (req, res) => {
	try {
		const candidates = await getIceCandidatesService(
			req.params.sessionId,
			req.query.fromDeviceId,
		)

		await res.code(200).send({ candidates })
	} catch (err) {
		logger.error(err)
		await res.code(500).send({ error: "Internal Server Error" })
	}
}
