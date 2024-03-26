import { type NextPage } from "next";
import { type AppProps } from "next/app";
import { type ReactElement, type ReactNode } from "react";
import "@dotkomonline/config/tailwind.css";
import "../styles/globals.css";
import { Poppins } from "next/font/google";
import { cn } from "@dotkomonline/ui";
import { SessionProvider } from "next-auth/react";
import { trpc } from "@/utils/trpc";
import MainLayout from "../components/layout/MainLayout";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export type NextPageWithLayout<P = Record<string, never>> = NextPage<P> & {
  getLayout?(page: ReactElement): ReactNode;
};

type CustomAppProps<P> = AppProps & {
  Component: NextPageWithLayout<P>;
};

function CustomApp<P>({
  Component,
  pageProps,
}: CustomAppProps<P>): JSX.Element {
  const getLayout =
    Component.getLayout ?? ((page) => <MainLayout>{page}</MainLayout>);

  return (
    <SessionProvider>
      <div className={cn(poppins.variable, "h-full w-full")}>
        {getLayout(<Component {...pageProps} />)}
      </div>
    </SessionProvider>
  );
}

export default trpc.withTRPC(CustomApp);
