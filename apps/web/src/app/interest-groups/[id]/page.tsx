import { getServerClient } from "@/utils/trpc/serverClient";

const InterestGroupDetails = async ({
    params: { id },
}: {
    params: { id: string };
}) => {
    const serverClient = await getServerClient();
    const interestGroup = await serverClient.interestGroup.get(id);
    return (
        <>
            {interestGroup != null ? (
                <h1>{interestGroup.id}</h1>
            ) : (
                <h3>Not found</h3>
            )}
        </>
    );
};

export default InterestGroupDetails;
