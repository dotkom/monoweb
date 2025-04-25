import { NodeCommitteeList } from "@/components/organisms/NodeCommitteeList"
import Link from "next/link"

export default async function NodeCommitteePage() {
  return (
    <div>
      <div className="border-slate-7 border-b">
        <div className="flex flex-col py-5">
          <p className="mt-4 text-3xl font-bold border-b-0">Nodekomiteer</p>
          <p className="text-slate-11 pt-2">På denne siden finner du informasjon om alle de forskjellige nodekomiteene i Online.</p>
          <p className="text-slate-11 pt-2">En nodekomite er periodebaserte underkomiteer av kjernekomiteene i Online. Dette vil si at nodekomiteene og
            deres medlemmer bare er aktive under visse perioder, og ikke kontinuerlig slik som kjernekomiteene.
            Hovedoppgaven til nodekomiteene er å organisere og gjennomføre sentrale hendelser i linjeforeningen Online.</p>
          <p className="text-slate-11 pt-2">
            Mer informasjon finnes{" "}
            <Link
              className="hover:underline text-blue-8"
              href={"https://wiki.online.ntnu.no/info/innsikt-og-interface/nodekomiteer/"}
            >
              her.
            </Link>
          </p>
        </div>
      </div>
      <div className="mt-12">
        <NodeCommitteeList />
      </div>
    </div>
  )
}
