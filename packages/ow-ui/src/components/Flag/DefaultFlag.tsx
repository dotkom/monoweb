import { css } from "@stitches/react"
import { ReactNode } from "react"
import { FC } from "react"
import { IoClose } from "react-icons/io5"
import { AlertIcon } from "../Alert/AlertIcon"

export interface IProps {
  title: string
  children: ReactNode
  status: "info" | "warning" | "success" | "danger"
}

const DefaultFlag: FC<IProps> = ({ children, title, status }) => {
  return (
    <div className={styles.container()}>
      <div className={styles.header()}>
        <div className={styles.titleContainer()}>
          <AlertIcon status={status}></AlertIcon>
          <p className={styles.title()}>{title}</p>
        </div>
        <button className={styles.closeButton()}>
          <IoClose className={styles.icon()}></IoClose>
        </button>
      </div>
      <div className={styles.content()}>
        <p>{children}</p>
        <button className={styles.actionButton()}>Understood</button>
      </div>
    </div>
  )
}

const styles = {
  icon: css({
    height: "24px",
    width: "24px",
  }),
  titleContainer: css({
    display: "flex",
    alignItems: "center",
  }),
  closeButton: css({
    border: "none",
    backgroundColor: "transparent",
    color: "$gray1",
    width: "24px",
    height: "24px",
    justifySelf: "left",
    "&:hover": {
      transform: "translateY(-1px)",
      color: "$gray3",
      cursor: "pointer",
    },
    "&:active": {
      transform: "translateY(1px)",
      color: "$gray2",
    },
  }),
  actionButton: css({
    backgroundColor: "transparent",
    border: "none",
    fontSize: "16px",
    color: "$info1",
    padding: 0,
    "&:hover": {
      color: "$info3",
      cursor: "pointer",
      transform: "translateY(-1px)",
    },
    "&:active": {
      transform: "translateY(1px)",
      color: "$info2",
    },
  }),
  header: css({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    columnGap: "280px",
  }),
  content: css({
    paddingLeft: "40px",
    paddingRight: "40px",
    marginTop: "-20px",
  }),
  title: css({
    paddingLeft: "8px",
    fontSize: "16px",
    fontWeight: 600,
  }),
  container: css({
    boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
    width: "400px",
    height: "136px",
    padding: "16px",
    paddingTop: "6px",
  }),
}

export default DefaultFlag
