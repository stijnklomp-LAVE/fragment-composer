/**
 * Shared schema for the account-deletion message published to RabbitMQ.
 *
 * The controller (producer) publishes messages conforming to this shape.
 * The worker (consumer) validates incoming messages against it.
 */

export type AccountDeletionMessage = {
	type: "account-deletion"
	userId: string
}

export const isAccountDeletionMessage = (
	value: unknown,
): value is AccountDeletionMessage => {
	if (typeof value !== "object" || value === null) return false

	const msg = value as Record<string, unknown>

	if (msg.type !== "account-deletion") return false

	if (typeof msg.userId !== "string" || msg.userId.length === 0) return false

	return true
}
