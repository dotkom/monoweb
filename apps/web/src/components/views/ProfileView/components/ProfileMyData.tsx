import { Button } from "@dotkomonline/ui"

const ProfileMyData = () => {
  return (
    <div className="divide-slate-7 flex w-full flex-col divide-y">
      <div>
        <p className="mb-7 text-3xl font-semibold">Din data</p>
        <Button color="blue" variant="solid" className="mb-5">
          Last ned brukerdata
        </Button>
      </div>
      <div>
        <p className="my-7 text-3xl font-semibold">Slett din bruker</p>
        <Button color="red" variant="solid" className="mb-5">
          Slett bruker
        </Button>
      </div>
    </div>
  )
}
export default ProfileMyData