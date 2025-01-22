import InterestGroupList from "@/components/organisms/InterestGroupList";
import { Button } from "@dotkomonline/ui";
import Link from "next/link";

export const InterestGroupsView = () => {
    return (
        <div className="my-8">
            <h1 className="mb-5">Interessegrupper</h1>
            <p>
                På denne siden finner du informasjon om alle de forskjellige
                interessegruppene i online. Ser du noe som ser interessant ut?
                Ta kontakt og møt noen med samme interesser som deg.
                Interessegruppene i Online er grupper for alle mulige slags
                interesser. Har du og en kompis eller to en
                sær/stilig/fantastisk interesse? Opprett en interessegruppe!
            </p>
            <p className="pt-4">
                Mer informasjon om hvordan dette gjøres finnes{" "}
                <Link
                    className="hover:underline text-blue-8"
                    href={
                        "https://wiki.online.ntnu.no/info/innsikt-og-interface/interessegrupper/"
                    }
                >
                    her.
                </Link>
            </p>
            <Link
                href={
                    "https://docs.google.com/forms/d/e/1FAIpQLSebaBslZ3nmh2wubQ_mPJYYU2XNIRlJZ1BooFuH7y6wxylaWA/viewform"
                }
            >
                <Button className="mr-4 mt-4">Opprett interessegruppe</Button>
            </Link>
            <Link
                href={
                    "https://docs.google.com/forms/d/e/1FAIpQLScr27q7C4gDvzHXajydznfFxPs7JaGpgYrNX4RPiVRvUHXVGg/viewform?pli=1"
                }
            >
                <Button>Søk om støtte</Button>
            </Link>
            <div className="mt-16">
                <InterestGroupList />
            </div>
        </div>
    );
};

export default InterestGroupsView;
