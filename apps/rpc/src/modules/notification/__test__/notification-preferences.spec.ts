import { describe, expect, it } from "vitest"
import {
  getNotificationPermissionField,
  shouldBypassNotificationPreferences,
} from "../notification-preferences"

describe("getNotificationPermissionField", () => {
  it("maps notification types to permission fields", () => {
    expect(getNotificationPermissionField("NEW_ARTICLE")).toBe("newArticles")
    expect(getNotificationPermissionField("NEW_MARK")).toBe("markRulesUpdates")
    expect(getNotificationPermissionField("NEW_INTEREST_GROUP")).toBe("groupMessages")
    expect(getNotificationPermissionField("EVENT_REGISTRATION")).toBe("registrationStart")
    expect(getNotificationPermissionField("JOB_LISTING_REMINDER")).toBe("applications")
    expect(getNotificationPermissionField("NEW_JOB_LISTING")).toBe("applications")
    expect(getNotificationPermissionField("NEW_EVENT")).toBe("standardNotifications")
    expect(getNotificationPermissionField("EVENT_REMINDER")).toBe("standardNotifications")
  })

  it("falls back to standardNotifications for unmapped types", () => {
    expect(getNotificationPermissionField("BROADCAST")).toBe("standardNotifications")
  })
})

describe("shouldBypassNotificationPreferences", () => {
  it("bypasses only BROADCAST_IMPORTANT", () => {
    expect(shouldBypassNotificationPreferences("BROADCAST_IMPORTANT")).toBe(true)
    expect(shouldBypassNotificationPreferences("BROADCAST")).toBe(false)
    expect(shouldBypassNotificationPreferences("NEW_ARTICLE")).toBe(false)
  })
})
