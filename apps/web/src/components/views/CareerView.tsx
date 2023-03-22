import { CareerProps } from "@/pages/career"
import { FC } from "react"
import CompanyAdListItem from "../molecules/CompanyAdListItem"

const CareerView: FC<CareerProps> = (props: CareerProps) => {
  // return <div> 404 Siden finnes ikke </div>

  return (
    <div>
      <div className="bg-amber-10 w-full">
        <div className="m-auto h-[200px] max-w-[800px] p-5 text-center">
          <p className="text-slate-3 leading-1.4 mt-5 text-4xl font-bold">
            Er du på jakt etter{" "}
            <span className="bg-50% bg-[url('/for-company-text-decor.svg')] bg-center bg-no-repeat">jobb</span>?
          </p>
          <p className="text-slate-3 leading-1.4 text-2xl font-bold">
            Bedrifter betaler 15 000 for å være med på denne lista så pls søk eller så får ikke Online penger uwu
          </p>
        </div>
      </div>
      <div className="m-4 my-auto max-w-[800px]">
        <div className="border-slate-11 grid grid-cols-4 gap-4 border-b-2 pl-2">
          <p className="mb-2 text-xl font-medium">Bedrift</p>
          <p className="mb-2 text-xl font-medium">Rolle</p>
          <p className="mb-2 text-xl font-medium">Sted</p>
          <p className="mb-2 text-xl font-medium">Frist</p>
        </div>
        <div className="flex flex-col">
          {props.careers.map((c) => (
            <>
            <CompanyAdListItem career={c} />
            </>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CareerView
