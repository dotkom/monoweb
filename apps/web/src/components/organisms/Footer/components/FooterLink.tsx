import { cva } from "cva"
import Link from "next/link"

interface FooterLinkProps {
  label: string
  large?: boolean
  href: string
}

export const FooterLink = ({ label, href, large = false }: FooterLinkProps) => (
  <li className={link({ large })}>
    <Link href={href}>{label}</Link>
  </li>
)

const link = cva("text-slate-12 cursor-pointer", {
  variants: {
    large: {
      true: "text-xl font-bold",
      false: "text-lg font-medium",
    },
  },
})
