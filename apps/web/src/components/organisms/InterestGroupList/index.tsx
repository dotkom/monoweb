import InterestGroupListItem from "@/components/molecules/InterestGroupListItem";

export interface InterestGroupListProps {
    itemOnClick: any;
}

export const InterestGroupList = (props: InterestGroupListProps) => {
    const numbers = Array(13).fill(0);

    return (
        <div className="grid grid-cols-[repeat(auto-fill,_minmax(250px,_1fr))] w-10/12 2xl:grid-cols-4 gap-12 mx-auto">
            {numbers.map((k, index) => (
                <InterestGroupListItem
                    key={index}
                    itemOnClick={() => props.itemOnClick(index)}
                />
            ))}
        </div>
    );
};

export default InterestGroupList;
