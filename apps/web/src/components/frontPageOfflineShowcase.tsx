"use client";

import { Button, Title } from "@dotkomonline/ui";
import Link from "next/link";
import { OfflineCard } from "./molecules/OfflineCard";
import { Offline } from "@dotkomonline/rpc/offline";

interface Props {
  offline: Offline;
}

export const FrontPageOfflineShowcase = ({ offline }: Props) => {
  return (
    <div className=" flex flex-col gap-2 bg-blue-100 dark:bg-amber-100 dark:text-black rounded-2xl">
      <div className="flex flex-col p-4 gap-2 ">
        <Text>Nyeste utgaven av Offline</Text>
        <Title className="text-lg md:text-4xl font-bold">Offline #</Title>
        <Title className="text-lg md:text-s font-bold">2026</Title>
        <Text className=" text-muted-foreground">
          Offline er Onlines sitt eget tidsskrift. Det gis ut to ganger i
          semesteret og innholder en fin blanding av underholdende og
          oppplysende saker for informatikkstudenter.
        </Text>
        <div className="flex gap-4 pt-4">
          <Button variant="default" size="lg">
            Les utgaven
          </Button>
          <Button
            color="gray"
            size="lg"
            element={Link}
            href="/om-linjeforeningen"
          >
            Les mer om oss
          </Button>
        </div>
      </div>
      <div>
        <OfflineCard offline={offline} key={offline.id} showTitle={false} />
      </div>
    </div>
  );
};
