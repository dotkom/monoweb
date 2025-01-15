import clsx from "clsx"
import Image from "next/image"

interface Props {
  href: string
  iconHref: string
  label: string
}

export const ActionLink = ({ href, iconHref, label }: Props) => (
  <a
    className={clsx("flex bg-slate-4 p-3 rounded-lg items-center min-w-24 gap-[2ch]")}
    href={href}
    target="_blank"
    rel="noreferrer"
  >
    <Image src={iconHref} alt={label} height={0} width={0} className="h-5 w-auto" />
    <span className="flex-1 font-semibold">{label}</span>
  </a>
)
