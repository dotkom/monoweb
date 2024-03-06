import { HTMLAttributes } from "react";
import { cn } from "@dotkomonline/ui";
import { ComingEvent } from "@/components/molecules/ComingEvent/ComingEvent";

export function EventListTile(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        "bg-blue-11 max-h-[800px] rounded-2xl overflow-scroll p-auto p-5 col-span-2 row-span-2 space-y-4",
      )}
    >
      {Array.from({ length: 7 }).map((_, i) => (
        <ComingEvent key={i} />
      ))}
    </div>
  );
}
