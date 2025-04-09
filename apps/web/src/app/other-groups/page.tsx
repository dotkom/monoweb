import OtherGroupList from "@/components/organisms/OtherGroupList"

const OtherGroupsPage = async () => {
  return (
    <div className="my-8">
      <h1 className="mb-5">Grupper tilknyttet Online</h1>
      <p>
        På denne siden finner du informasjon om gruppene under Online, som verken er interessegrupper eller komiteer.
      </p>

      <div className="mt-12">
        <OtherGroupList />
      </div>
    </div>
  )
}

export default OtherGroupsPage
