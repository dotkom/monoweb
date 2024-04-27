import clsx from "clsx"
import Image from "next/image"

interface Props {
  href: string
  iconHref: string
  label: string
}

export const ActionLink = ({ href, iconHref, label }: Props) => (
  <a className={clsx("flex bg-slate-4 p-2 rounded-md items-center w-24")} href={href} target="_blank" rel="noreferrer">
    <Image src={iconHref} alt={label} width={16} height={16} />
    <span className="flex-1 text-center">{label}</span>
  </a>
)
