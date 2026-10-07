"use client";

import { Button, Title, Text } from "@dotkomonline/ui";
import Link from "next/link";
import { OfflineCard } from "./molecules/OfflineCard";
import type { Offline } from "@dotkomonline/rpc/offline";

interface Props {
  offline: Offline;
}

export const FrontPageOfflineShowcase = ({ offline }: Props) => {
  return (
    <div className=" flex flex-row items-center m-30 justify-between gap-4 p-8 bg-blue-100 dark:bg-amber-100 dark:text-black rounded-2xl">
      {/*Teksten til venstre*/}
      <div className="flex flex-col gap-2 max-w-xl">
        <Text>Nyeste utgaven av Offline</Text>
        <Title className="text-lg md:text-4xl font-bold">  {offline.title}</Title>
        <Title className="text-lg md:text-s font-bold">2026</Title>
        <Text className=" text-muted-foreground">
          Offline er Onlines sitt eget tidsskrift. Det gis ut to ganger i
          semesteret og innholder en fin blanding av underholdende og
          oppplysende saker for informatikkstudenter.
        </Text>
        <div className="flex gap-4 pt-4">
          <Button variant="default" size="lg" element={Link} href={offline.fileUrl ?? "/offline"}>
            Les utgaven
          </Button>
          <Button className="bg-transparent border-0" size="lg" element={Link} href="/offline">
            Les tidligere utgaver
          </Button>
        </div>
      </div>
      {/*Offline til høyre*/}
      <div className= "shrink-0 mr-0 origin-top-right scale-125">
        <OfflineCard offline={offline} key={offline.id} showTitle={false} />
      </div>
    </div>
  );
};
