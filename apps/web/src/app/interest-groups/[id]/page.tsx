import OnlineIcon from "@/components/atoms/OnlineIcon";
import { getServerClient } from "@/utils/trpc/serverClient";
import Link from "next/link";

const InterestPage = async ({ params: { id } }: { params: { id: string } }) => {
    const serverClient = await getServerClient();
    const interestGroup = await serverClient.interestGroup.get(id);

    return interestGroup != null ? (
        <div className="p-14 my-16 mx-auto border-slate-3 rounded-lg border shadow-md w-10/12 ">
            <Link
                className="bg-transparent p-0 hover:underline mb-4"
                href={`/interest-groups`}>
                {"<"} Tilbake
            </Link>
            <div className="flex md:flex-row flex-col-reverse">
                <div className="mr-4">
                    <h2 className="text-lg border-none !mt-4">
                        {interestGroup.name}
                    </h2>
                    <p className="mt-2">
                        {interestGroup.longDescription
                            ? interestGroup.longDescription
                            : interestGroup.description}
                    </p>
                    {interestGroup.joinInfo && (
                        <section className="mt-10">
                            <h3 className="text-lg border-none">Kontakt</h3>
                            {interestGroup.joinInfo}
                        </section>
                    )}
                    {interestGroup.link && (
                        <Link
                            className="hover:underline text-blue-10 block mt-4"
                            href={`${interestGroup.link}`}
                        >
                            Gå til Wikisiden her
                        </Link>
                    )}
                </div>
                <OnlineIcon className="max-w-[200px] min-w-[200px] py-auto m-auto sm:mb-auto mb-9 mt-2" />
            </div>
        </div>
    ) : (
        <h3>Not found</h3>
    );
};

export default InterestPage;
