import type { PropsWithChildren } from "react";

import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";

import { AuthProvider } from "./AuthProvider";
import { ModalProvider } from "./ModalProvider";
import { QueryProvider } from "./QueryProvider";

export default async function RootLayout({ children }: PropsWithChildren) {
    return (
        <html lang="en">
            <head>
                <ColorSchemeScript />
            </head>
            <body>
                <AuthProvider>
                    <QueryProvider>
                        <MantineProvider>
                            <Notifications />
                            <ModalProvider>{children}</ModalProvider>
                        </MantineProvider>
                    </QueryProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
