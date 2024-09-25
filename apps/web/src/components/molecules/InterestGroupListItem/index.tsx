import OnlineIcon from "@/components/atoms/OnlineIcon";
import { Button } from "@dotkomonline/ui";
import { FC } from "react";

export interface InterestGroupListItemProps {
    itemOnClick: any;
}

const InterestGroupListItem: FC<InterestGroupListItemProps> = (
    props: InterestGroupListItemProps
) => (
    <div className="p-4 py-8 text-center m-1 shadow-md min-w-[250px]">
        <OnlineIcon className="w-5/12 mx-auto" />
        <h2 className="text-sm border-none !mt-4">Stipendsushi</h2>
        <p className="mt-2 text-left px-3">
            Stipendsushi er en nodekomité for alle onlinere som liker sushi.
            Rundt den 15. hver måned arrangeres det felles tur til et spisested
            i byen som serverer sushi.
        </p>
        <Button className="mt-4" onClick={() => props.itemOnClick(0)}>
            Les mer
        </Button>
    </div>
);

export default InterestGroupListItem;
