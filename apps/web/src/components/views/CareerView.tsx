import type { CareerAd } from "@/api/get-career-ads"
import CompanyAdListItem from "../molecules/CompanyAdListItem"

const CareerView = ({ careers }: { careers: CareerAd[] }) => (
  <div>
    <div className="bg-amber-9 absolute left-0 top-[56px] h-[250px] w-full opacity-30" />
    <div className="absolute left-0 top-[56px] flex h-[250px] w-full flex-col justify-center">
      <div className="text-slate-3 m-auto h-[200px] max-w-[800px] p-5 text-center">
        <p className="leading-1.4 mt-5  text-4xl font-bold">
          Er du på jakt etter <span className="bg-amber-6 bg-center bg-no-repeat">jobb</span>?
        </p>
        <p className="leading-1.4 mt-7 text-2xl font-bold">
          Her har du en liste over bedrifter som er ute etter deg som informatikkstudent!
        </p>
      </div>
    </div>
    <div className="m-4 my-auto mt-[250px] w-[900px]">
      <div className="border-slate-11 flex justify-between border-b-2">
        <p className="mb-2 w-[25%] text-xl font-medium">Bedrift</p>
        <p className="mb-2 w-[25%] text-xl font-medium">Rolle</p>
        <p className="mb-2 w-[17.5%] text-xl font-medium">Sted</p>
        <p className="mb-2 w-[17.5%] text-xl font-medium">Frist</p>
        <p className="mb-2 w-[15%] text-xl font-medium">Søknadslink</p>
      </div>
      <div className="flex flex-col">
        {careers.map((c) => (
          <CompanyAdListItem career={c} key={c.link} />
        ))}
      </div>
      <div className="h-36" />
    </div>
  </div>
)

export default CareerView
