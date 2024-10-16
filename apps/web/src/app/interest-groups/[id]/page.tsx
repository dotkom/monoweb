import OnlineIcon from "@/components/atoms/OnlineIcon";
import { getServerClient } from "@/utils/trpc/serverClient";
import Link from "next/link";

const InterestPage = async ({ params: { id } }: { params: { id: string } }) => {
    const serverClient = await getServerClient();
    const interestGroup = await serverClient.interestGroup.get(id);

    return interestGroup != null ? (
        <div className="p-4 py-8 my-16 mx-auto shadow-md w-10/12 flex flex-row">
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
                    <div>
                        <h3 className="text-lg border-none !mt-4">Kontakt</h3>
                        {interestGroup.joinInfo}
                    </div>
                )}
                {interestGroup.link && (
                    <div>
                        <h3 className="text-lg border-none !mt-4">Wikiside</h3>
                        <Link
                            className="hover:underline text-blue-8"
                            href={`${interestGroup.link}`}
                        >
                            {interestGroup.link}
                        </Link>
                    </div>
                )}
            </div>
            <div className="ml-auto">
                <OnlineIcon className="w-[50%] min-w-[150px] ml-auto" />
            </div>
        </div>
    ) : (
        <h3>Not found</h3>
    );
};

export default InterestPage;
