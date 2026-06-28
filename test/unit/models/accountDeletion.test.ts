import { describe, test, expect } from "bun:test"

import { isAccountDeletionMessage } from "@/models/schemas/accountDeletion"

describe("accountDeletion message schema", () => {
	test("should validate a correct account-deletion message", () => {
		const msg: unknown = { type: "account-deletion", userId: "clx12345" }

		expect(isAccountDeletionMessage(msg)).toBe(true)
	})

	test("should reject a message missing userId", () => {
		const msg: unknown = { type: "account-deletion" }

		expect(isAccountDeletionMessage(msg)).toBe(false)
	})

	test("should reject a message with empty userId", () => {
		const msg: unknown = { type: "account-deletion", userId: "" }

		expect(isAccountDeletionMessage(msg)).toBe(false)
	})

	test("should reject a message with wrong type", () => {
		const msg: unknown = { type: "some-other-task", userId: "clx12345" }

		expect(isAccountDeletionMessage(msg)).toBe(false)
	})

	test("should reject null", () => {
		expect(isAccountDeletionMessage(null)).toBe(false)
	})

	test("should reject non-object values", () => {
		expect(isAccountDeletionMessage("string")).toBe(false)
		expect(isAccountDeletionMessage(42)).toBe(false)
		expect(isAccountDeletionMessage(undefined)).toBe(false)
	})
})
