import { styled } from "@theme";
import { VFC } from "react";
import "./animation.css";

const Wave = styled("div", {
  width: "100%",
  marginBottom: "-10px",
  padding: "0",
});

const G = styled("g", {
  margin: "0",
  transform: "scaleY(0.2) translateY(180px)",
});

export const Waves: VFC = () => (
  <Wave>
    <svg viewBox="0 24 150 25" preserveAspectRatio="none" shape-rendering="auto">
      <defs>
        <path id="gentle-wave" d="M-0 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"></path>
      </defs>
      <G className="parallax">
        <use href="#gentle-wave" x="0" y="0" fill="rgba(13, 37, 70, 0.4)"></use>
        <use href="#gentle-wave" x="-10" y="5" fill="rgba(13, 37, 70, 0.4)"></use>
        <use href="#gentle-wave" x="-20" y="10" fill="rgba(13, 37, 70, 0.4)"></use>
        <use href="#gentle-wave" x="-30" y="15" fill="rgba(13, 37, 70, 1)"></use>
      </G>
    </svg>
  </Wave>
);
