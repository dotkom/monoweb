import { Circle } from "@dotkomonline/ui/"
import type { FC } from "react"

interface CompanyInterestProcessProps {
  steps: string[]
}

const CompanyInterestProcess: FC<CompanyInterestProcessProps> = ({ steps }) => {
  return (
    <div className="mx-auto flex flex-col items-center md:flex-wrap md:flex-row md:items-stretch justify-evenly max-w-[1024px] px-16 py-4 lg:flex-nowrap ">
      {steps.map((step, index) => (
        <>
          <div key={step} className="mb-1 w-36 flex flex-col items-center z-10 py-3">
            <Circle size={700 / 15} color="bg-brand-lighter">
              <p className="text-white font-bold text-background">{index + 1}</p>
            </Circle>
            <p className="text-brand-lighter text-center text-xl font-semibold mt-9 md:mt-14">{step}</p>
          </div>
          {index !== steps.length - 1 && (
            <svg
              width="171"
              height="85"
              viewBox="0 0 165 33"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`${index % 2 === 0 ? "rotate-180 mt-6" : "-mt-10"} -mr-10 -ml-10 hidden lg:block`}
            >
              <title>Hva som skjer etter du har sendt din interesse</title>
              <path
                d="M1 32L14.2545 25.4507C40.8415 12.3136 54.1349 5.74505 68.0752 3.24369C79.9121 1.11974 92.0351 1.14832 103.862 3.32806C117.79 5.89513 131.053 12.5263 157.577 25.7886L170 32"
                stroke="#153E75"
                strokeWidth="2"
                strokeDasharray="6 6"
              />
            </svg>
          )}
        </>
      ))}
    </div>
  )
}

export default CompanyInterestProcess
