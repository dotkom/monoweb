import { trpc } from "@/utils/trpc";
import "@dotkomonline/config/tailwind.css";
import { cn } from "@dotkomonline/ui";
import { type NextPage } from "next";
import { type AppProps } from "next/app";
import { Poppins } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { type ReactElement, type ReactNode } from "react";

import MainLayout from "../components/layout/MainLayout";
import "../styles/globals.css";

const poppins = Poppins({ subsets: ["latin"], variable: "--font-poppins", weight: ["400", "500", "600", "700"] });

export type NextPageWithLayout<P = Record<string, never>> = NextPage<P> & {
    getLayout?(page: ReactElement): ReactNode;
};

type CustomAppProps<P> = AppProps & {
    Component: NextPageWithLayout<P>;
};

function CustomApp<P>({ Component, pageProps }: CustomAppProps<P>): JSX.Element {
    const getLayout = Component.getLayout ?? ((page) => <MainLayout>{page}</MainLayout>);

    return (
        <SessionProvider>
            <ThemeProvider>
                <div className={cn(poppins.variable, "h-full w-full")}>{getLayout(<Component {...pageProps} />)}</div>
            </ThemeProvider>
        </SessionProvider>
    );
}

export default trpc.withTRPC(CustomApp);
