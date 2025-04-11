import { cva } from "cva"
import Link from "next/link"
import type { FC } from "react"

export type FooterLinkProps = {
  label: string
  large?: boolean
  href: string
}

export const FooterLink: FC<FooterLinkProps> = ({ label, href, large = false }) => (
  <li className={link({ large })}>
    <Link href={href}>{label}</Link>
  </li>
)

const link = cva("text-white cursor-pointer", {
  variants: {
    large: {
      true: "text-xl font-bold uppercase",
      false: "text-lg font-medium",
    },
  },
})
