"use client"

import { usePalette } from "@/components/PaletteProvider"
import type { FC, PropsWithChildren } from "react"
import styles from "./HalloweenBackdrop.module.css"

export const PaletteBackdrop: FC<PropsWithChildren> = ({ children }) =>
  usePalette().palette === "halloween" ? (
    <div className={styles.frame}>
      <div className={styles.content}>{children}</div>
      <div aria-hidden="true" className={styles.bottom} />
    </div>
  ) : (
    children
  )
