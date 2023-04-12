import { CareerProps } from "@/pages/career"
import { FC } from "react"
import CompanyAdListItem from "../molecules/CompanyAdListItem"

const CareerView: FC<CareerProps> = (props: CareerProps) => {
  // return <div> 404 Siden finnes ikke </div>

  return (
    <div>
      <div className="absolute left-0 h-[250px] top-[56px] z-0 w-full opacity-30 bg-amber-9" />
      <div className="absolute left-0 h-[250px] top-[56px] z-10 flex w-full flex-col justify-center">
        <div className="m-auto h-[200px] max-w-[800px] p-5 text-center">
          <p className="leading-1.4 mt-5 text-4xl font-bold">
            Er du på jakt etter{" "}
            <span className="bg-50% bg-[url('/for-company-text-decor.svg')] bg-center bg-no-repeat">jobb</span>?
          </p>
          <p className="leading-1.4 text-2xl font-bold mt-7">
            Bedrifter betaler 15 000 for å være med på denne lista så pls søk eller så får ikke Online penger uwu
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
          {props.careers.map((c) => (
            <>
              <CompanyAdListItem career={c} />
            </>
          ))}
        </div>
        <div className="h-36"></div>
      </div>
    </div>
  )
}

export default CareerView
