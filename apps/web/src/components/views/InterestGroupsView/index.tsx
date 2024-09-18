import InterestGroupListItem from "@/components/molecules/InterestGroupListItem";

export const InterestGroupsView = () => {
    const numbers = [1, 2, 3, 4, 5, 1, 1, 1, 1];

    return (
        <div className="flex flex-row flex-wrap w-5/6 items-center justify-around mx-auto">
            {numbers.map((k, index) => (
                <InterestGroupListItem key={index} />
            ))}
        </div>
    );
};

export default InterestGroupsView;
