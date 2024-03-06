import React, { HTMLAttributes } from "react"
import { cn } from "@dotkomonline/ui"

export function PlaceholderTile(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={
        cn("bg-[#f0f0f0] min-h-[400px] rounded-2xl col-span-1 p-4 space-y-4", props.className)
      }>
      {/* Simulate a header/title placeholder */}
      <div className="bg-[#ddd] rounded-full w-3/4 h-6"></div>
      {/* Simulate a subtitle or smaller header placeholder */}
      <div className="bg-[#ddd] rounded-full w-5/6 h-5"></div>
      {/* Simulate content lines or details */}
      <div className="bg-[#ddd] rounded-full w-full h-4"></div>
      <div className="bg-[#ddd] rounded-full w-2/3 h-4"></div>
      <div className="bg-[#ddd] rounded-full w-5/6 h-4"></div>
    </div>
  );
}
