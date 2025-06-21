import { cva } from "cva"
import type { VariantProps } from "cva"
import type { ComponentPropsWithRef, ElementType, PropsWithChildren } from "react"
import { cn } from "../../utils"

export const CARD_SIZES = ["md", "lg", "xl"] as const
export const CARD_VARIANTS = ["outline", "solid"] as const
export const CARD_SMALL_ROUNDING = [true, false] as const
export const CARD_CENTER_CONTENT = [true, false] as const
export const CARD_CENTER_TITLE = [true, false] as const

type CardSize = (typeof CARD_SIZES)[number]
type CardVariant = (typeof CARD_VARIANTS)[number]
type CardSmallRounding = (typeof CARD_SMALL_ROUNDING)[number]

export type CardProps<E extends ElementType = "div"> = PropsWithChildren &
  VariantProps<typeof card> & {
    element?: E
    className?: string
    centerContent?: boolean
    centerTitle?: boolean
  } & (
    | {
        title: React.ReactNode
        titleClassName?: string
        innerClassName?: string
      }
    | {
        title?: undefined
        titleClassName?: never
        innerClassName?: never
      }
  ) &
  ComponentPropsWithRef<E>

export function Card<E extends ElementType = "div">({
  element,
  ref,
  className,
  children,
  title,
  titleClassName,
  innerClassName,
  centerContent,
  centerTitle,
  ...props
}: CardProps<E>) {
  const Component = element ?? "div"

  const styles = {
    card: cn(card(props)),
    flex: "flex flex-col gap-2",
    centerContent: centerContent ? "items-center justify-center" : "",
  } as const satisfies Record<string, string | string[]>

  if (!title) {
    const classes = cn(styles.card, styles.flex, styles.centerContent, className)

    return (
      <Component ref={ref} className={classes} {...props}>
        {children}
      </Component>
    )
  }

  // Because the rounded-xx already "exists", we can use rounded-xx and Tailwind
  // will still apply the class correctly. This is why `rounded-xx rounded-?-none`
  // is used, instead of just `rounded-b-xx`
  const roundedStyle = styles.card?.match(/(rounded-[a-z]{2})/)?.[1]
  const paddingStyle = styles.card?.match(/(p-\d)/)?.[1]

  const shouldCenterTitle = centerTitle !== false && (centerTitle || props.variant !== "outline")

  const classesOuter = cn(styles.card, "p-0", className)
  const classesTitle = cn(
    styles.flex,
    props.variant !== "outline" && "bg-slate-5",
    "px-4 py-2 text-sm font-bold",
    roundedStyle && `${roundedStyle} rounded-b-none`,
    shouldCenterTitle && "items-center",
    titleClassName
  )
  const classesInner = cn(
    styles.flex,
    styles.centerContent,
    paddingStyle,
    roundedStyle && `${roundedStyle} rounded-t-none`,
    innerClassName
  )

  return (
    <Component ref={ref} className={classesOuter} {...props}>
      <div className={classesTitle}>{title}</div>
      <div className={classesInner}>{children}</div>
    </Component>
  )
}

const card = cva("", {
  variants: {
    size: {
      md: "p-3 rounded-lg",
      lg: "p-4 rounded-xl",
      xl: "p-4 rounded-2xl min-h-[4rem]",
    },
    variant: {
      outline: "border border-slate-5",
      solid: "bg-slate-3",
    },
    smallRounding: {
      true: "",
      false: "",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "outline",
    smallrounding: false,
  },
  compoundVariants: [
    {
      size: "md",
      smallRounding: true,
      className: "rounded-md",
    },
    {
      size: "lg",
      smallRounding: true,
      className: "rounded-lg",
    },
    {
      size: "xl",
      smallRounding: true,
      className: "rounded-lg",
    },
  ],
} satisfies {
  variants: {
    size: Record<CardSize, string>
    variant: Record<CardVariant, string>
    smallRounding: Record<`${CardSmallRounding}`, string>
  }
  defaultVariants: {
    size?: CardSize
    variant?: CardVariant
    smallRounding?: CardSmallRounding
  }
  compoundVariants: Array<{
    size?: CardSize
    variant?: CardVariant
    smallRounding?: CardSmallRounding
    className: string
  }>
})
