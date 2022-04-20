import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { FiMenu } from "react-icons/fi";
import { css } from "@theme";

const ContentTrigger = () => {
  return (
    <DropdownMenuTrigger asChild>
      <button className={styles.button()}>
        <FiMenu size={20} />
      </button>
    </DropdownMenuTrigger>
  );
};

const styles = {
  button: css({
    all: "unset",
    marginRight: "20px",
    height: 35,
    width: 35,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    cursor: "pointer",
    "&:hover": { color: "gray" },
  }),
};

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export default ContentTrigger;
