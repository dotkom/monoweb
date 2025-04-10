import { NodeCommitteeList } from "@/components/organisms/NodeCommitteeList"
import Link from "next/link"

export default async function NodeCommitteePage() {
  return (
    <div className="my-8">
      <h1 className="mb-5">Nodekomiteer</h1>
      <p>På denne siden finner du informasjon om alle de forskjellige nodekomiteene i Online.</p>
      <p>
        <br />
        En nodekomite er periodebaserte underkomiteer av kjernekomiteene i Online. Dette vil si at nodekomiteene og
        deres medlemmer bare er aktive under visse perioder, og ikke kontinuerlig slik som kjernekomiteene.
        Hovedoppgaven til nodekomiteene er å organisere og gjennomføre sentrale hendelser i linjeforeningen Online.
      </p>
      <p className="pt-4">
        Mer informasjon finnes{" "}
        <Link
          className="hover:underline text-blue-8"
          href={"https://wiki.online.ntnu.no/info/innsikt-og-interface/nodekomiteer/"}
        >
          her.
        </Link>
      </p>
      <div className="mt-16">
        <NodeCommitteeList />
      </div>
    </div>
  )
}
