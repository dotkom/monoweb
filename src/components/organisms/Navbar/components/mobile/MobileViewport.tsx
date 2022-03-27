import { styled, keyframes } from "@stitches/react";
import { FC } from "react";

interface MobileProps {
  isOpen: string;
}

const MobileViewport: FC<MobileProps> = ({ children, isOpen }) => {
  const Modal = styled("div", {
    position: "absolute",
    backgroundColor: "#fff",
    boxShadow: "0px 10px 38px -10px rgba(22, 23, 24, 0.35), 0px 10px 20px -15px rgba(22, 23, 24, 0.2)",

    minWidth: "95vw",
    flexDirection: "column",
    marginLeft: "-90vw",
    display: `${isOpen}`,
    borderRadius: "5px",
  });

  return <Modal>{children}</Modal>;
};

export default MobileViewport;
