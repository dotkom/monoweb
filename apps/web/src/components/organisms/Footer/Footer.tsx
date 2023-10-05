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
            <Image alt="vercel" className="mt-4 self-center" height={30} src="/vercel.svg" width={150} />
        </a>
    </footer>
);

export default Footer;
