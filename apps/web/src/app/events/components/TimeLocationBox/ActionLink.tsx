import clsx from "clsx"

interface Props {
  href: string
  iconHref: string
  label: string
  className?: string
}

export const ActionLink = ({ href, iconHref, label, className }: Props) => (
  <a
    className={clsx("flex bg-slate-4 p-2 rounded-md items-center", className)}
    href={href}
    target="_blank"
    rel="noreferrer"
  >
    <img src={iconHref} alt={label} className="w-4 ml-2" />
    <span className="flex-1 text-center">{label}</span>
  </a>
)
