import React, { HTMLAttributes } from "react";
import { cn } from "@dotkomonline/ui";

export function LargeEventTile(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        "bg-[#0B365B] h-[400px] rounded-2xl overflow-hidden p-5 col-span-2",
        props.className,
      )}
    >
      <img
        src="https://online.ntnu.no/_next/image?url=https%3A%2F%2Fonlineweb4-prod.s3.eu-north-1.amazonaws.com%2Fmedia%2Fimages%2Fresponsive%2Flg%2Fce114612-3848-40f8-8ac0-f7267556c4bb.jpeg&w=1200&q=75"
        alt="online"
        className="w-full h-3/5 object-cover rounded-2xl"
      />
      <br />
      <h2 className="m-0 text-white">AI-utviklerverktøy: Kurs med Computas</h2>
    </div>
  );
}
