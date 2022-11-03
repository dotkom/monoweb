import type * as Stitches from "@stitches/react"
import { ConfigType } from "@stitches/react/types/config"

export const utils: ConfigType.Utils = {
  bg: (value: Stitches.PropertyValue<"backgroundColor">) => {
    return {
      background: value,
    }
  },
  mx: (value: Stitches.PropertyValue<"backgroundColor">) => {
    return {
      marginLeft: value,
      marginRight: value,
    }
  },
  my: (value: Stitches.ScaleValue<"space">) => {
    return {
      marginTop: value,
      marginBottom: value,
    }
  },
  px: (value: Stitches.ScaleValue<"space">) => {
    return {
      paddingLeft: value,
      paddingRight: value,
    }
  },
  py: (value: Stitches.ScaleValue<"space">) => {
    return {
      paddingTop: value,
      paddingBottom: value,
    }
  },
  fullWidth: (value: boolean) => {
    return value === true
      ? {
          width: "100vw",
          position: "relative",
          left: "50%",
          right: "50%",
          marginLeft: "-50vw",
          marginRight: "-50vw",
        }
      : {}
  },
  transitionVariant: (value: string) => {
    switch (value) {
      case "colors":
        return {
          transitionProperty: "color, background-color, border-color, text-decoration-color, fill, stroke",
          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
          transitionDuration: "150ms",
        }
      default:
        return {}
    }
  },
}
