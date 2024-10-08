import { PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren) {
  return <div className="lg:px-64 px-16 py-16">
    {children}
  </div>
}