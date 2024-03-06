import { Badge } from "@dotkomonline/ui";
import Image from "next/image";
import React from "react";

export const ComingEvent = () => {
  return (
    <div className="rounded-2xl overflow-hidden w-full h-[88px] bg-[#031024] flex items-center justify-center flex-row">
      <div className="w-1/2 h-full">
        <img
          src="https://online.ntnu.no/_next/image?url=https%3A%2F%2Fonlineweb4-prod.s3.eu-north-1.amazonaws.com%2Fmedia%2Fimages%2Fresponsive%2Flg%2F3d71d8a0-4376-4c6e-bcbe-4cbee0af42ed.png&w=1200&q=75"
          alt="online"
          className="object-cover object-center h-full w-full"
        />
      </div>

      <div className="flex flex-col justify-center ml-4">
        <h3 className="m-0 text-white">KiD - Velkommen til arbeidslivet</h3>
        <div>
          <p className="text-white">50/50</p>
        </div>
      </div>
    </div>
  );
};
