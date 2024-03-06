import React from "react";
import { useSession } from "next-auth/react";
import { OnlineCompanySplash } from "@/components/organisms/OnlineCompanySplash/OnlineCompanySplash";
import { EventsPane } from "@/components/organisms/EventsPane";
import { DotkomAdTile } from "@/tiles/dotkom-ad-tile/DotkomAdTile";
import { PlaceholderTile } from "@/tiles/placeholder-tile/PlaceholderTile";
import { LargeEventTile } from "@/tiles/large-event-tile/LargeEventTile";
import { EventListTile } from "@/tiles/event-list-tile/EventListTile";

const Home: React.FC = () => {
  const auth = useSession();

  return (
    <div>
      // {auth.status === "unauthenticated" && <OnlineCompanySplash />}

      <div className="grid grid-cols-2 gap-4 p-10 sm:grid-cols-3 md:grid-cols-5">
        <LargeEventTile className="hidden md:block" />
        <EventListTile />
        <DotkomAdTile />
        <PlaceholderTile className="col-span-1 row-span-1" />
        <PlaceholderTile className="col-span-1 row-span-1" />
        <PlaceholderTile className="col-span-1 row-span-1" />
      </div>
    </div>
  );
};

export default Home;
