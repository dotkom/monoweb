import { authOptions } from "@dotkomonline/auth/src/web.app";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { type PropsWithChildren } from "react";

import { ApplicationShell } from "../ApplicationShell";

export default async function DashboardLayout({ children }: PropsWithChildren) {
    const session = await getServerSession(authOptions);

    if (session === null) {
        redirect("/");
    }

    return <ApplicationShell>{children}</ApplicationShell>;
}
