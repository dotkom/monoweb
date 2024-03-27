"use client";
import { OnlineIcon } from "@dotkomonline/ui";
import Link from "next/link";

export default function Page() {
  return (
    <>
      <div className="p-20 flex items-end gap-10">
        <h3 className="pl-20 text-2xl font-black">vår nye wiki 🔥🔥🔥</h3>
      </div>
      <div className="flex flex-col w-full items-center gap-16 justify-center">
        <h1 className="text-9xl gap-10 flex">
          <span className="font-bold bg-gradient-to-r from-blue-8 to-indigo-11 text-transparent bg-clip-text">
            KnowItAll
          </span>
          🧠
        </h1>
        <Link href="/wiki" className="flex items-center gap-4 bg-gradient-to-r from-blue-8 to-indigo-11 py-4 px-10 rounded-lg hover:bg-blue-63">
            <p className="text-xl text-white font-bold hover:underline">open le wiki..</p>
        </Link>
      </div>
    </>
  );
}
