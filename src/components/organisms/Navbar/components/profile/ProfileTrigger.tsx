import AvatarImage from "./AvatarImage";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { css } from "@theme";

export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const ProfileTrigger = () => {
  return (
    <DropdownMenuTrigger asChild>
      <button className={styles.button()}>
        <AvatarImage />
      </button>
    </DropdownMenuTrigger>
  );
};

const styles = {
  button: css({
    all: "unset",
    fontFamily: "inherit",
    borderRadius: "100%",
    height: 45,
    width: 45,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  }),
};

export default ProfileTrigger;
