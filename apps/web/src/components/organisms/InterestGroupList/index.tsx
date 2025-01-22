import InterestGroupListItem from "@/components/molecules/InterestGroupListItem";
import { getServerClient } from "@/utils/trpc/serverClient";

export const InterestGroupList = async () => {
    const serverClient = await getServerClient();
    const interestGroups = (await serverClient.interestGroup.all()).data;

    return (
        <div className="grid grid-cols-[repeat(auto-fill,_minmax(250px,_1fr))] w-10/12 2xl:grid-cols-4 gap-12 mx-auto">
            {interestGroups.map((interestGroup, index) => (
                <InterestGroupListItem
                    key={index}
                    interestGroup={interestGroup}
                />
            ))}
        </div>
    );
};

export default InterestGroupList;
