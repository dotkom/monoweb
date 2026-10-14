"use client";

import { Button, Title, Text } from "@dotkomonline/ui";
import Link from "next/link";
import { OfflineCard } from "./molecules/OfflineCard";
import type { Offline } from "@dotkomonline/rpc/offline";
import { getYear } from "node_modules/date-fns";

interface Props {
  offline: Offline;
}

export const FrontPageOfflineShowcase = ({ offline }: Props) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] items-center mb-16 xl:mx-30 gap-y-4 gap-x-6 p-6 bg-blue-100 dark:bg-neutral-600 dark:text-muted-foreground rounded-2xl md:p-8 mx-4 md:mx-8">
      {/*Teksten til venstre*/}
      <div className="min-w-0 md:col-start-1 md:row-start-1 md:self-end flex flex-col gap-2 max-w-xl">
        <Text className="hidden text-2xl lg:block md:block">
          Nyeste utgaven av Offline
        </Text>

        <Title className="text-2xl md:text-4xl font-semibold md:font-bold ">
          {" "}
          {offline.title}
        </Title>
        <Title className="text-lg font-bold">
          {getYear(offline.publishedAt)}
        </Title>
        <Text className="hidden md:block text-muted-foreground">
          Offline er Onlines sitt eget tidsskrift. Det gis ut to ganger i
          semesteret og innholder en fin blanding av underholdende og
          oppplysende saker for informatikkstudenter.
        </Text>
      </div>
      {/*Offline til høyre*/}
      <div className="justify-self-center md:col-start-2 md:row-start-1 md:row-span-2 shrink-0 lg:ml-14 lg:origin-top-right lg:scale-125">
        <OfflineCard offline={offline} key={offline.id} showTitle={false} />
      </div>

      <div className="flex flex-wrap justify-center md:justify-start md:col-start-1 md:row-start-2 md:self-start gap-4">
        <Button
          className="hidden md:inline-flex"
          variant="default"
          size="lg"
          element={Link}
          href={offline.fileUrl ?? "/offline"}
        >
          Les utgaven
        </Button>
        <Button
          className="bg-transparent border-0"
          size="lg"
          element={Link}
          href="/offline"
        >
          Les tidligere utgaver
        </Button>
      </div>
    </div>
  );
};
