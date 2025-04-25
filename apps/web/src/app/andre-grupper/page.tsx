import { OtherGroupList } from "@/components/organisms/OtherGroupList"

export default async function OtherGroupsPage() {
  return (
    <div>
      <div className="border-slate-7 border-b">
        <div className="flex flex-col py-5">
          <p className="mt-4 text-3xl font-bold border-b-0">Grupper tilknyttet Online</p>
          <p className="text-slate-11 pt-2">
            På denne siden finner du informasjon om gruppene under Online, som verken er interessegrupper eller
            komiteer.
          </p>
        </div>
      </div>

      <div className="mt-12">
        <OtherGroupList />
      </div>
    </div>
  )
}
