import OnlineIcon from "@/components/atoms/OnlineIcon";
import { Button } from "@dotkomonline/ui";

const InterestGroupListItem = () => {
    return (
        <div className="p-4 py-8 w-4/12 text-center m-1 shadow">
            <OnlineIcon className="w-5/12 mx-auto" />
            <h2 className="text-sm border-none !mt-4">Stipendsushi</h2>
            <p className="mt-2 text-left px-3">
                Stipendsushi er en nodekomité for alle onlinere som liker sushi.
                Rundt den 15. hver måned arrangeres det felles tur til et
                spisested i byen som serverer sushi.
            </p>
            <Button className="mt-4">Les mer</Button>
        </div>
    );
};

export default InterestGroupListItem;
