import { describe, test, afterEach, beforeEach, expect, mock } from "bun:test"

import * as prismaModule from "@/common/prisma"
import { loggerMocks } from "../setup"
import { queueClient } from "@/infrastructure/rabbitMQ"

const mockTransaction = mock()
const mockTransferRequestDeleteMany = mock()
const mockUserDelete = mock()

const mockTx = {
	transferRequest: { deleteMany: mockTransferRequestDeleteMany },
	user: { delete: mockUserDelete },
}

// The preloaded test/context.ts makes prismaClient a function () => prismaMock.
// The worker accesses $transaction on prismaClient directly.
// Add $transaction as a property on the prismaClient function.
const prismaClient = prismaModule.prismaClient as { $transaction: unknown }
prismaClient.$transaction = mockTransaction

const mockInit = mock<() => Promise<void>>()
const mockPublish =
	mock<
		(
			channel: string,
			exchange: string,
			routingKey: string,
			message: string,
		) => Promise<boolean>
	>()
const mockConsume =
	mock<
		(
			channel: string,
			queue: string,
			bindings: Record<string, string>,
			callback: (
				msg: unknown,
				channel: { ack: () => void; nack: () => void },
			) => void,
		) => Promise<boolean>
	>()

const mockChannel = {
	ack: mock<() => void>(),
	nack: mock<() => void>(),
}

queueClient.init = mockInit
queueClient.consume = mockConsume as unknown as typeof queueClient.consume
queueClient.publish = mockPublish

const loadWorker = async () => {
	const { startWorker } = await import("@/worker/index")

	return startWorker
}

describe("worker account deletion", () => {
	beforeEach(() => {
		mockTransaction.mockImplementation(
			async (cb: (tx: Record<string, unknown>) => Promise<unknown>) =>
				await cb(mockTx),
		)
	})

	afterEach(() => {
		mock.clearAllMocks()
	})

	test("should process account-deletion message by deleting user data in a transaction", async () => {
		mockConsume.mockImplementation(
			(_channel, _queue, _bindings, callback) => {
				callback(
					{
						content: Buffer.from(
							JSON.stringify({
								type: "account-deletion",
								userId: "user-1",
							}),
						),
					},
					mockChannel,
				)

				return Promise.resolve(true)
			},
		)

		const startWorker = await loadWorker()
		await startWorker()
		await new Promise((r) => setTimeout(r, 0))

		expect(mockTransaction).toHaveBeenCalledTimes(1)
		expect(mockTransferRequestDeleteMany).toHaveBeenCalledWith({
			where: { participants: { none: {} } },
		})
		expect(mockUserDelete).toHaveBeenCalledWith({
			where: { id: "user-1" },
		})
		expect(mockChannel.ack).toHaveBeenCalled()
		expect(mockPublish).not.toHaveBeenCalled()
	})

	test("should ack without transaction for non-account-deletion messages", async () => {
		mockConsume.mockImplementation(
			(_channel, _queue, _bindings, callback) => {
				callback(
					{
						content: Buffer.from(
							JSON.stringify({ type: "some-other-task" }),
						),
					},
					mockChannel,
				)

				return Promise.resolve(true)
			},
		)

		const startWorker = await loadWorker()
		await startWorker()

		expect(mockTransaction).not.toHaveBeenCalled()
		expect(mockChannel.ack).toHaveBeenCalled()
	})

	test("should handle account-deletion transaction failure gracefully without DLQ", async () => {
		mockTransaction.mockRejectedValueOnce(
			new Error("DB transaction failed"),
		)
		mockConsume.mockImplementation(
			(_channel, _queue, _bindings, callback) => {
				callback(
					{
						content: Buffer.from(
							JSON.stringify({
								type: "account-deletion",
								userId: "user-1",
							}),
						),
					},
					mockChannel,
				)

				return Promise.resolve(true)
			},
		)

		const startWorker = await loadWorker()
		await startWorker()

		expect(mockTransaction).toHaveBeenCalledTimes(1)
		expect(mockChannel.ack).toHaveBeenCalled()
		expect(mockPublish).not.toHaveBeenCalled()
		expect(loggerMocks.info).toHaveBeenCalledWith(
			{
				result: {
					deletionResult: "failed",
					error: "Error: DB transaction failed",
					userId: "user-1",
				},
			},
			"Worker processed message",
		)
	})

	test("should handle account-deletion message with missing userId gracefully", async () => {
		mockConsume.mockImplementation(
			(_channel, _queue, _bindings, callback) => {
				callback(
					{
						content: Buffer.from(
							JSON.stringify({
								type: "account-deletion",
							}),
						),
					},
					mockChannel,
				)

				return Promise.resolve(true)
			},
		)

		const startWorker = await loadWorker()
		await startWorker()

		expect(mockTransaction).not.toHaveBeenCalled()
		expect(mockChannel.ack).toHaveBeenCalled()
		expect(loggerMocks.info).toHaveBeenCalledWith(
			{ result: { error: "Missing userId in account-deletion payload" } },
			"Worker processed message",
		)
	})
})
