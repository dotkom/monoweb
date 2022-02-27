import { VFC } from "react";
import { styled } from "@theme";

interface FooterProps {
  test: string;
}

const footerStyle = {
  backgroundColor: "#0D2546",
  color: "white",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};
/*
const Foot = styled("footer", {
  margin: 0,
  color: "White",
  height: 250,
  backgroundColor: "#0D2546",
});
*/

const A = styled("a", {
  textAlign: "center",

  fontSize: "1.2em",
  padding: "1px 10px",
  color: "White",

  textDecoration: "none",
});

const Footer: VFC<FooterProps> = ({ test }) => {
  const links = ["PROFIL", "HJEM", "KARRIERE", "WIKI", "BIDRA"];
  const facts = ["Besøksadresse", "Kontaktinformasjon", "Post og faktura"];

  return (
    <footer style={{ width: "100%" }}>
      <div style={{ ...footerStyle }}>
        <div style={{ padding: 0, margin: "auto" }}>
          {links.map((link) => (
            <A key={link} style={{ fontWeight: "bold", fontSize: "1.5em" }}>
              {link}
            </A>
          ))}
        </div>

        <div style={{ padding: 0, margin: "auto" }}>
          {facts.map((fact) => (
            <A key={fact} style={{ borderRight: "solid 2px White" }}>
              {fact}
            </A>
          ))}
        </div>

        <p style={{ margin: "auto" }}>Feil på nettsiden?</p>
        <p style={{ margin: "auto" }}>
          Ta kontakt med <span style={{ color: "red" }}>Dotkom</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
