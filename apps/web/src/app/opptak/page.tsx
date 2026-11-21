"use client"

import { Button, Text, Title } from "@dotkomonline/ui"
import { IconArrowRight } from "@tabler/icons-react"
import Image from "next/image"
import Link from "next/link"

export default async function OpptakPage() {
  return (
    <div className="max-w-6xl mx-auto mt-10 lg:mt-20 px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-8 lg:gap-6">
      <div className="w-full lg:w-1/2 flex flex-col">
        <Title element="h1" className="mb-4 text-4xl sm:text-5xl lg:text-6xl font-bold">
          Online Opptak
        </Title>
        <Text size="md" className="mb-8 text-gray-600">
          Her kan du søke for å bli en del av en av Onlines komiteer. Komitémedlemmene våre får Online til å gå rundt, og arbeider for at alle informatikkstudenter skal ha en flott studiehverdag.
        </Text>
        <div className="flex flex-wrap gap-3">
          <Button iconRight={<IconArrowRight/>} variant="default" size="xl" element={Link} href="/">Søk nå</Button>
          <Button element={Link} size="xl" href="/">Om opptak</Button>
          <Button element={Link} size="xl" href="/grupper">Komiteer</Button>
        </div>
      </div>
      <div className="hidden sm:block w-full lg:w-1/2">
        <Image
          alt="placeholder"
          className="object-contain rounded-2xl w-full h-auto"
          width={600}
          height={300}
          src="/genfors-banner.jpeg"
        />
      </div>
    </div>
  )
}