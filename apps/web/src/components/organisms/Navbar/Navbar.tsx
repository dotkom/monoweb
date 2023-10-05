import OnlineIcon from "@/components/atoms/OnlineIcon";
import Link from "next/link";
import React from "react";

import { MainNavigation } from "./MainNavigation";
import { MobileNavigation } from "./MobileNavigation";
import { ProfileMenu } from "./ProfileMenu";
import { type MenuLink } from "./types";

const links: Array<MenuLink> = [
    {
        href: "/events",
        title: "Arrangementer",
    },
    {
        href: "/career",
        title: "Karriere",
    },
    {
        items: [
            {
                description: "På denne siden finner du informasjon om alle de forskjellige interessegruppene i online",
                href: "#",
                title: "Interessegrupper",
            },
            {
                description: "Informasjon om Linjeforeningen",
                href: "#",
                title: "Om Linjeforeningen Online",
            },
        ],
        title: "Om oss",
    },
    {
        items: [
            { description: "Kontakt Linjeforening", href: "/company-info", title: "Kontakt" },
            { description: "Online sitt Kvitteringskjema", href: "/company-info", title: "Kvitteringskjema" },
            { description: "Faktura", href: "/company-info", title: "Faktura" },
            { description: "Interesert?", href: "/company-info", title: "Interesseskjema" },
        ],
        title: "For bedrifter",
    },
];

export const Navbar = () => (
    <header className="mx-auto w-full max-w-screen-xl px-4 sm:px-9">
        <div className="border-blue-12/20 flex h-16 border-b">
            <MobileNavigation links={links} />
            <Link className="flex items-center" href="/">
                <OnlineIcon className="fill-brand h-[24px] dark:fill-white" />
            </Link>
            <MainNavigation links={links} />
            <div className="flex flex-grow items-center justify-end md:flex-grow-0">
                <ProfileMenu />
            </div>
        </div>
    </header>
);
