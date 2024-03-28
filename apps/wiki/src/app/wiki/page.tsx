import { getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Tiptap } from "src/components/tiptap";
import { getArticle } from "src/hooks/get-article";

type PathParams = {
    params: {
      path: string[]
    }
  }
  

export default async function Page({ params }: PathParams) {
    const session = await getServerSession();
  return (
    <>
      <div className="p-20">
        <Tiptap
          access={session ? true : false}
          json={{}}
        />
      </div>
    </>
  );
}
