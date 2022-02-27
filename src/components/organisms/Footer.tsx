import { VFC } from "react";

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

const Footer: VFC<FooterProps> = ({ test }) => {
  const links = ["PROFIL", "HJEM", "KARRIERE", "WIKI", "BIDRA"];
  const facts = ["Besøksadresse", "Kontaktinformasjon", "Post og faktura"];

  return (
    <footer style={{ width: "100%" }}>
      <div style={{ backgroundColor: "orange", width: "100%", height: "20px" }} />

      <div style={{ ...footerStyle }}>
        <ul style={{ margin: 0, padding: 0 }}>
          {links.map((link) => (
            <li key={link} style={{ display: "inline-block", margin: 16, fontWeight: "bold" }}>
              {link}
            </li>
          ))}
        </ul>

        <ul style={{ margin: 0, padding: 0 }}>
          {facts.map((fact) => (
            <li key={fact} style={{ display: "inline-block", margin: 16, fontSize: "16px" }}>
              {fact}
            </li>
          ))}
        </ul>

        <p>Feil på nettsiden?</p>
        <p>
          Ta kontakt med <span style={{ color: "red" }}>Dotkom</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
