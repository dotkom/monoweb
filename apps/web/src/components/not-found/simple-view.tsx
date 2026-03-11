import { Button, Text, Title } from "@dotkomonline/ui"
import Image from "next/image"
import Link from "next/link"

export const NotFoundSimple = () => (
  <div className="flex flex-col items-center justify-center gap-8 min-h-[calc(100vh-5rem)]">
    <Image src="/online-logo-o.svg" alt="Online logo" width={160} height={160} className="dark:hidden" />
    <Image src="/online-logo-o-darkmode.svg" alt="Online logo" width={160} height={160} className="hidden dark:block" />
    <Title className="text-6xl">404</Title>
    <Text className="text-lg text-slate-500 font-mono italic">Siden finnes ikke.</Text>
    <Button className="w-fit rounded-lg px-6 py-3" color="brand" element={Link} href="/">
      Gå til forsiden
    </Button>
  </div>
)
