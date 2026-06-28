import { describe, test, afterEach, expect, mock } from "bun:test"

import * as prismaModule from "@/common/prisma"
import { createMockRequest, createMockResponse } from "@/utils/http"
import { queueClient } from "@/infrastructure/rabbitMQ"
import { loggerMocks } from "../../setup"

// The preloaded test/context.ts makes prismaClient a function () => prismaMock.
// The accountCleanup controller accesses $queryRaw on prismaClient directly.
// Add $queryRaw as a property on the prismaClient function.
const mockQueryRaw = mock()
const prismaClient = prismaModule.prismaClient as { $queryRaw: unknown }
prismaClient.$queryRaw = mockQueryRaw

const { processExpiredDeletionsHandler } =
	await import("@/controllers/accountCleanup")

const mockPublish =
	mock<
		(
			channel: string,
			exchange: string,
			routingKey: string,
			message: string,
		) => Promise<boolean>
	>()

queueClient.publish = mockPublish

describe("Account cleanup controller", () => {
	afterEach(() => {
		mock.clearAllMocks()
	})

	test("should respond with processed 0 when no expired users found", async () => {
		mockQueryRaw.mockResolvedValue([])

		const req = createMockRequest()
		const { reply, statusCode, payload } = createMockResponse()

		await processExpiredDeletionsHandler(req, reply)

		expect(statusCode()).toBe(200)
		expect(payload()).toEqual({ processed: 0 })
		expect(mockPublish).not.toHaveBeenCalled()
	})

	test("should publish a message for each expired user", async () => {
		mockQueryRaw.mockResolvedValue([{ id: "user-1" }, { id: "user-2" }])
		mockPublish.mockResolvedValue(true)

		const req = createMockRequest()
		const { reply, statusCode, payload } = createMockResponse()

		await processExpiredDeletionsHandler(req, reply)

		expect(statusCode()).toBe(200)
		expect(payload()).toEqual({ processed: 2 })
		expect(mockPublish).toHaveBeenCalledTimes(2)
		expect(mockPublish).toHaveBeenCalledWith(
			"worker",
			"main",
			"account.deletion",
			JSON.stringify({ type: "account-deletion", userId: "user-1" }),
		)
		expect(mockPublish).toHaveBeenCalledWith(
			"worker",
			"main",
			"account.deletion",
			JSON.stringify({ type: "account-deletion", userId: "user-2" }),
		)
	})

	test("should log error when publish fails but continue processing", async () => {
		mockQueryRaw.mockResolvedValue([
			{ id: "user-1" },
			{ id: "user-2" },
			{ id: "user-3" },
		])
		mockPublish
			.mockResolvedValueOnce(true)
			.mockResolvedValueOnce(false)
			.mockResolvedValueOnce(true)

		const req = createMockRequest()
		const { reply, statusCode, payload } = createMockResponse()

		await processExpiredDeletionsHandler(req, reply)

		expect(statusCode()).toBe(200)
		expect(payload()).toEqual({ processed: 2 })
		expect(mockPublish).toHaveBeenCalledTimes(3)
		expect(loggerMocks.error).toHaveBeenCalledWith(
			{ userId: "user-2" },
			"Failed to publish account-deletion message",
		)
	})
})
