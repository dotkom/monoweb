import { describe, expect, it } from "vitest"
import { breadcrumbPath, resolveBreadcrumbTrailLabels } from "../breadcrumb-context"

describe("breadcrumbPath", () => {
  it("joins encoded segments", () => {
    expect(breadcrumbPath("grupper", "dotkom")).toBe("/admin/grupper/dotkom")
  })
})

describe("resolveBreadcrumbTrailLabels", () => {
  const navigationLabels = {
    "/admin/grupper": "Grupper",
    "/admin/grupper/ny": "Ny gruppe",
  }

  it("shows navigation and registered labels when fully resolved", () => {
    const groupHref = breadcrumbPath("grupper", "dotkom")
    const medlemmerHref = breadcrumbPath("grupper", "dotkom", "medlemmer")
    const labels = {
      [groupHref]: "Drifts- og utviklingskomiteen",
      [medlemmerHref]: "Medlemmer",
    }

    expect(resolveBreadcrumbTrailLabels(["grupper", "dotkom", "medlemmer"], labels, null, navigationLabels)).toEqual([
      "Grupper",
      "Drifts- og utviklingskomiteen",
      "Medlemmer",
    ])
  })

  it("masks the suffix until every unknown segment is resolved", () => {
    const medlemmerHref = breadcrumbPath("grupper", "dotkom", "medlemmer")
    const labels = {
      [medlemmerHref]: "Medlemmer",
    }

    expect(resolveBreadcrumbTrailLabels(["grupper", "dotkom", "medlemmer"], labels, null, navigationLabels)).toEqual([
      "Grupper",
      null,
      null,
    ])
  })

  it("reveals the full suffix once all trailing segments are known", () => {
    const groupHref = breadcrumbPath("grupper", "dotkom")
    const medlemmerHref = breadcrumbPath("grupper", "dotkom", "medlemmer")
    const memberHref = breadcrumbPath("grupper", "dotkom", "medlemmer", "auth0|user")
    const labels = {
      [groupHref]: "Dotkom",
      [medlemmerHref]: "Medlemmer",
      [memberHref]: "Ola Nordmann",
    }

    expect(resolveBreadcrumbTrailLabels(["grupper", "dotkom", "medlemmer", "auth0|user"], labels)).toEqual([
      "Grupper",
      "Dotkom",
      "Medlemmer",
      "Ola Nordmann",
    ])
  })

  it("ignores registered labels under a held prefix until it is released", () => {
    const groupHref = breadcrumbPath("grupper", "dotkom")
    const medlemmerHref = breadcrumbPath("grupper", "dotkom", "medlemmer")
    const memberHref = breadcrumbPath("grupper", "dotkom", "medlemmer", "auth0|user")
    const labels = {
      [groupHref]: "Dotkom",
      [medlemmerHref]: "Medlemmer",
      [memberHref]: "Ola Nordmann",
    }

    expect(resolveBreadcrumbTrailLabels(["grupper", "dotkom", "medlemmer", "auth0|user"], labels, groupHref)).toEqual([
      "Grupper",
      null,
      null,
      null,
    ])

    expect(resolveBreadcrumbTrailLabels(["grupper", "dotkom", "medlemmer", "auth0|user"], labels, null)).toEqual([
      "Grupper",
      "Dotkom",
      "Medlemmer",
      "Ola Nordmann",
    ])
  })
})
