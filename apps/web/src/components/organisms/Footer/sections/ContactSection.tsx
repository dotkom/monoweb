import { cva } from "cva"

export const ContactSection = () => (
  <div className="flex flex-col text-center">
    <div className={text()}>Feil på nettsiden?</div>
    <div className={text()}>
      Ta kontakt med{" "}
      <a className={text({ red: true })} href="mailto:dotkom@online.ntnu.no">
        Dotkom
      </a>
    </div>
  </div>
)

const text = cva("text-slate-12 font-medium", {
  variants: {
    red: {
      true: "text-red-11",
    },
  },
})
