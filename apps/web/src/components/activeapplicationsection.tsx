"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Title, Text } from "@dotkomonline/ui";

export const ActiveApplicationSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="w-full relative z-1 h-[6rem] bg-blue-200 rounded-2xl px-8 flex justify-between items-center">
      <div>
        <Title>Komité-opptaket er i gang!</Title>
        <Text>Søk verv i en av online sine mange komitéer</Text>
      </div>
      <div className="w-1/3 flex justify-end gap-4">
        <Button variant="default" size="xl"><Link href="/opptak">Søk komité</Link></Button>
        <Button size="xl"><Link href="/grupper">Info om våre komitéer</Link></Button>
      </div>
    </div>
  );
};