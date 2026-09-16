"use client"

import { Button, Text, Title } from "@dotkomonline/ui"
import { IconArrowRight } from "@tabler/icons-react"
import Image from "next/image"
import Link from "next/link"

export default async function OpptakPage() {
  return (
    <div className="max-w-6xl mx-auto mt-20 flex items-center">
      <div className="w-1/2 flex flex-col">
        <Title element="h1" className="mb-4 text-6xl font-bold">
          Online Opptak
        </Title>
        <Text size="md" className="mb-8 text-gray-600">
          Her kan du søke for å bli en del av en av Onlines komiteer. Komitémedlemmene våre får Online til å gå rundt, og arbeider for at alle informatikkstudenter skal ha en flott studiehverdag.
        </Text>
        <div className="flex gap-3">
          <Button iconRight={<IconArrowRight/>} variant="default" size="xl" element={Link} href="/">Søk nå</Button>
          <Button element={Link} size="xl" href="/">Om opptak</Button>
          <Button element={Link} size="xl" href="/">Komiteer</Button>
        </div>
      </div>
      <div className="w-1/2">
        <Image
          alt="placeholder"
          className="object-contain rounded-2xl w-full h-auto"
          width={600}
          height={300}src="/genfors-banner.jpeg"/>
      </div>
    </div>
  )
}