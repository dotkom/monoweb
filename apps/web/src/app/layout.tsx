import type { ReactElement, ReactNode } from "react";
import "@dotkomonline/config/tailwind.css";
import "../styles/globals.css";
import { Inter, Poppins } from "next/font/google";
import { cn } from "@dotkomonline/ui";
import { trpc } from "@/utils/trpc";
import MainLayout from "@/components/layout/MainLayout";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

function RootLayout({ children }: { children: ReactNode }): ReactElement {
  return (
    <html lang="en">
      <body>
        <main>
          <div className={cn(poppins.className, "h-full w-full")}>
            <MainLayout>{children}</MainLayout>
          </div>
        </main>
      </body>
    </html>
  );
}

export default RootLayout;
