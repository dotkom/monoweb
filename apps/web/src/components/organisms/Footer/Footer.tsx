import { styled } from "@theme"
import { Waves } from "./components/Waves"
import { SoMeSection } from "./sections/SoMeSection"
import { LinksSection } from "./sections/LinksSection"
import { ContactSection } from "./sections/ContactSection"

const Container = styled("footer", {
  display: "flex",
  flexDirection: "column",
  width: "100%",
})

const FooterWrapper = styled("div", {
  backgroundColor: "$blue1",
  color: "$white",
  width: "100%",
  paddingTop: "1.5em",
  paddingBottom: "2.4em",
})

const links = {
  main: ["PROFIL", "HJEM", "KARRIERE", "WIKI", "BIDRA"],
  second: ["Besøksadresse", "Kontaktinformasjon", "Post og faktura"],
}

const Footer = () => (
  <Container>
    <Waves />
    <FooterWrapper>
      <SoMeSection />
      <LinksSection links={links} />
      <ContactSection />
    </FooterWrapper>
  </Container>
)

export default Footer
