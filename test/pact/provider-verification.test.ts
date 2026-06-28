import { describe, test, expect, mock, beforeAll, afterAll } from "bun:test"
import { Verifier } from "@pact-foundation/pact"

import * as prismaModule from "@/common/prisma"
import { buildApp } from "@/api/app"

// Mock auth to bypass JWT verification during Pact tests
await mock.module("@/middleware/auth", () => ({
	default: Object.assign(
		(fastify: {
			addHook: (hook: string, fn: (...args: unknown[]) => void) => void
		}) => {
			fastify.addHook("onRequest", (...args: unknown[]) => {
				const request = args[0] as { userId?: string }
				request.userId = "pact-verifier-user"
			})
		},
		{ [Symbol.for("fastify.display-name")]: "auth" },
	),
}))

// Mock cache and queue (not needed for Pact verification)
const mockInit = mock().mockResolvedValue(undefined)

await mock.module("@/infrastructure/cache", () => ({
	cacheClient: { init: mockInit },
}))

await mock.module("@/infrastructure/rabbitMQ", () => ({
	queueClient: { init: mockInit },
}))

// Set up Prisma mock responses by adding methods to the preloaded prismaClient function.
// This avoids mock.module leakage that affects other test files.
const prismaClient = prismaModule.prismaClient as unknown as Record<
	string,
	unknown
>
const mockQueryRaw = mock().mockResolvedValue([])
const mockTransaction = mock().mockImplementation(
	async (cb: (tx: unknown) => Promise<unknown>) =>
		cb({
			transferRequest: { deleteMany: mock() },
			user: { delete: mock() },
		}),
)

prismaClient.$connect = mock().mockResolvedValue(undefined)
prismaClient.$disconnect = mock().mockResolvedValue(undefined)
prismaClient.$queryRaw = mockQueryRaw
prismaClient.$transaction = mockTransaction
prismaClient.device = {
	create: mock().mockResolvedValue({
		createdAt: "2024-01-01T00:00:00Z",
		deviceId: "device-456",
		deviceName: "New Camera",
		updatedAt: "2024-01-01T00:00:00Z",
	}),
	findMany: mock().mockResolvedValue([
		{
			createdAt: "2024-01-01T00:00:00Z",
			deviceId: "device-123",
			deviceName: "Test Camera",
			updatedAt: "2024-01-01T00:00:00Z",
		},
	]),
}
prismaClient.user = {
	findMany: mock().mockResolvedValue([]),
}

const PORT = 3099
const pactFile = `${process.cwd()}/pacts/video-editor-client-fragment-composer.json`

describe("Pact provider verification: fragment-composer", () => {
	let app: Awaited<ReturnType<typeof buildApp>>

	beforeAll(async () => {
		app = buildApp()
		await app.ready()
		await app.listen({ host: "127.0.0.1", port: PORT })
	})

	afterAll(async () => {
		await app.close()
	})

	test("should satisfy all consumer expectations", async () => {
		const verifier = new Verifier({
			pactUrls: [pactFile],
			provider: "fragment-composer",
			providerBaseUrl: `http://127.0.0.1:${PORT.toString()}`,
		})

		const resultJson = await verifier.verifyProvider()
		const result = JSON.parse(resultJson) as { result: boolean }

		expect(result.result).toBe(true)
	})
})
