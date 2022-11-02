import { Fragment } from "react"

interface LinksSectionProps {
  links: {
    main: string[]
    second: string[]
  }
}

export const LinksSection = ({ links }: LinksSectionProps) => (
  <div className="mx-12 mb-4 flex items-start gap-8 sm:flex-col sm:items-center sm:gap-0">
    <div className="my-8 flex flex-col justify-center gap-8 sm:flex-row">
      {links.main.map((link) => (
        <div className="text-slate-12 cursor-pointer text-xl font-bold" key={link}>
          {link}
        </div>
      ))}
    </div>

    <div className="my-8 flex flex-col justify-center gap-8 sm:mt-0 sm:flex-row">
      {links.second.map((link) => (
        <div className="text-slate-12 cursor-pointer text-lg font-medium" key={link}>
          {link}
        </div>
      ))}
    </div>
  </div>
)
