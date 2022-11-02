import { Fragment } from "react"

interface LinksSectionProps {
  links: {
    main: string[]
    second: string[]
  }
}

export const LinksSection = ({ links }: LinksSectionProps) => (
  <Fragment>
    <div className="my-8 flex justify-center gap-8">
      {links.main.map((link) => (
        <div className="text-slate-12 cursor-pointer text-xl font-bold" key={link}>
          {link}
        </div>
      ))}
    </div>

    <div className="my-8 flex justify-center gap-8">
      {links.second.map((link) => (
        <div className="text-slate-12 cursor-pointer text-lg font-medium" key={link}>
          {link}
        </div>
      ))}
    </div>
  </Fragment>
)
