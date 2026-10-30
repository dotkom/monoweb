import styles from "./HalloweenBackdrop.module.css"
import type { FC, PropsWithChildren } from "react"

/** The two Illustrator borders bookend the page without following the viewport. */
export const HalloweenBackdrop: FC<PropsWithChildren> = ({ children }) => (
  <div className={styles.frame}>
    <div className={styles.content}>{children}</div>
    <div aria-hidden="true" className={styles.bottom} />
  </div>
)
