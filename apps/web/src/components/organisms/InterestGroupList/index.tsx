import InterestGroupListItem from "@/components/molecules/InterestGroupListItem";

export const InterestGroupList = () => {
    const numbers = [1, 2, 3, 4, 5, 1, 1, 1];

    return (
        <div className="grid grid-cols-[repeat(auto-fill,_minmax(250px,_1fr))] w-10/12 2xl:grid-cols-4 gap-12 mx-auto">
            {numbers.map((k, index) => (
                <InterestGroupListItem key={index} />
            ))}
        </div>
    );
};

export default InterestGroupList;
