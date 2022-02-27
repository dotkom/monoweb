import { keyframes } from "@stitches/react";
import { styled } from "@theme";
import { VFC } from "react";

const popup = keyframes({
  "0%": {
    transform: "translateY(40px)",
  },
  "100%": {
    transform: "translateY(0px)",
  },
});

const Wave = styled("div", {
  width: "100%",
  animation: `3.4s ${popup}`,
});

export const FooterHat: VFC = () => (
  <Wave>
    <svg viewBox="0 0 1440 132" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M-1440 0L-1360 3.64375C-1280 7.5625 -1120 14.4375 -960 36.6438C-800 58.4375 -640 95.5625 -480 110C-320 124.438 -160 117.562 0 88C160 58.4375 320 7.5625 480 3.64375C640 1.96695e-06 800 44 960 51.3562C1120 58.4375 1280 29.5625 1360 14.6438L1440 0V132H1360C1280 132 1120 132 960 132C800 132 640 132 480 132C320 132 160 132 0 132C-160 132 -320 132 -480 132C-640 132 -800 132 -960 132C-1120 132 -1280 132 -1360 132H-1440V0Z"
        fill="#FEE9CD"
      />
    </svg>
  </Wave>
);
