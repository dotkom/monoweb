import InterestGroupList from "@/components/organisms/InterestGroupList";
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
            <h2 className="border-none mb-2 !mt-8">
                Opprettelse av interessegruppe og søknad til støtte
            </h2>
            <p>
                For å opprette en ny interessegruppe, ta over en eksisterende,
                eller søke om økonomisk støtte til din interessegruppe, send en
                mail til{" "}
                <Link
                    className="hover:underline text-blue-8"
                    href={"mailto:backlog@online.ntnu.no"}
                >
                    backlog@online.ntnu.no
                </Link>
            </p>
            <p>
                Mer informasjon om hvordan dette gjøres finnes{" "}
                <Link
                    className="hover:underline text-blue-8"
                    href={
                        "https://wiki.online.ntnu.no/info/innsikt-og-interface/interessegrupper"
                    }
                >
                    her.
                </Link>
            </p>
            <div className="mt-16">
                <InterestGroupList />
            </div>
        </div>
    );
};

export default InterestGroupsView;
