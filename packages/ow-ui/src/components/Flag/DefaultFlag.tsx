import { css, styled } from "@stitches/react"
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
    <Container>
      <Header>
        <TitleContainer>
          <AlertIcon status={status}></AlertIcon>
          <Title>{title}</Title>
        </TitleContainer>
        <CloseButton>
          <IoClose className={styles.button()}></IoClose>
        </CloseButton>
      </Header>
      <Content>
        <p>{children}</p>
        <ActionButton>Understood</ActionButton>
      </Content>
    </Container>
  )
}

const TitleContainer = styled("div", { display: "flex", alignItems: "center" })
const styles = {
  button: css({
    height: "24px",
    width: "24px",
  }),
}

const CloseButton = styled("button", {
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
})

const ActionButton = styled("button", {
  backgroundColor: "transparent",
  border: "none",
  fontSize: "16px",
  color: "$info1",
  "&:hover": {
    color: "$info3",
    cursor: "pointer",
    transform: "translateY(-1px)",
  },
  "&:active": {
    transform: "translateY(1px)",
    color: "$info2",
  },
})

const Header = styled("div", {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  columnGap: "280px",
})

const Content = styled("div", {
  paddingLeft: "40px",
  paddingRight: "40px",
  marginTop: "-20px",
})

const Title = styled("p", {
  paddingLeft: "8px",
  fontSize: "16px",
  fontWeight: 600,
})

const Container = styled("div", {
  boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
  width: "400px",
  height: "136px",
  padding: "16px",
  paddingTop: "6px",
})

export default DefaultFlag
