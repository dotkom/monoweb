import Image from "next/image";
import { ContactSection } from "./sections/ContactSection";
import { LinksSection } from "./sections/LinksSection";
import { SoMeSection } from "./sections/SoMeSection";

export interface FooterLinkType {
    main: Array<string>;
    second: Array<string>;
}

const footerLinks: FooterLinkType = {
    main: ["PROFIL", "HJEM", "KARRIERE", "WIKI", "BIDRA"],
    second: ["Besøksadresse", "Kontaktinformasjon", "Post og faktura"],
};

const Footer = () => (
    <footer className="bg-blue flex w-full flex-col py-16">
        <SoMeSection />
        <LinksSection links={footerLinks} />
        <ContactSection />
        {/* Built with   */}
        <a href="https://vercel.com?utm_source=dotkom&utm_campaign=oss">
            <Image className="mt-4 self-center" src="/vercel.svg" alt="vercel" width={150} height={30} />
        </a>
    </footer>
);

export default Footer;
