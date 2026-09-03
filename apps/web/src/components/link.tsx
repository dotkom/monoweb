"use client"

import NextLink from "next/link"

/**
 * Client re-export of next/link for polymorphic props (e.g. Button element={Link}).
 * Next.js 16's server entry for next/link cannot be passed as a Client Component prop.
 */
export const Link = NextLink
