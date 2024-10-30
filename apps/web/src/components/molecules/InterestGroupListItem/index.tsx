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
    <div className="p-4 py-8 text-center m-1 shadow-md rounded-lg border-slate-3 border min-w-[250px] flex flex-col">
        <OnlineIcon className="w-5/12 mx-auto max-w-[150px] min-w-[120px]" />
        <h2 className="!text-3xl border-none !mt-4">
            {props.interestGroup.name}
            {!props.interestGroup.isActive && <> [inaktiv]</>}
        </h2>
        <p className="mt-2 mb-6 text-left px-3">
            {props.interestGroup.description}
        </p>
        <Link
            className="mt-auto text-xl hover:underline"
            href={`interest-groups/${props.interestGroup.id}`}
        >
            Les mer
        </Link>
    </div>
);

export default InterestGroupListItem;
