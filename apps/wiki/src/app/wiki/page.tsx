
import { getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import { Tiptap } from "src/components/tiptap";


export default async function Page() {
    const session = await getServerSession();
  return (
    <>
      <div className="p-20">
        <Tiptap
          access={session ? true : false}
          json='
          <p>This is a basic example of implementing images. Drag to re-order.</p>
          '
        />
      </div>
    </>
  );
}
