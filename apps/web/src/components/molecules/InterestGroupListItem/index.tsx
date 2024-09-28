import OnlineIcon from "@/components/atoms/OnlineIcon";
import { InterestGroup } from "@dotkomonline/types";
import Link from "next/link";
import { FC } from "react";

export interface InterestGroupListItemProps {
    interestGroup: InterestGroup;
}

const InterestGroupListItem: FC<InterestGroupListItemProps> = (
    props: InterestGroupListItemProps
) => (
    <div className="p-4 py-8 text-center m-1 shadow-md min-w-[250px]">
        <OnlineIcon className="w-5/12 mx-auto" />
        <h2 className="text-sm border-none !mt-4">
            {props.interestGroup.name}
        </h2>
        <p className="mt-2 text-left px-3">{props.interestGroup.description}</p>
        <Link href={`interest-groups/${props.interestGroup.id}`}>Les mer</Link>
    </div>
);

export default InterestGroupListItem;
