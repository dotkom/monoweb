import { type FC } from "react"
import { Circle } from "@dotkomonline/ui/"

interface CompanyInterestProcessProps {
  steps: string[]
}

const CompanyInterestProcess: FC<CompanyInterestProcessProps> = ({ steps }) => (
  <div className="mx-auto grid max-w-[1024px] grid-cols-1 px-3 py-4 md:grid-cols-2 lg:grid-cols-4">
    {steps.map((step, index) => (
      <div key={step} className="mb-1 flex flex-col items-center py-3">
        <Circle size={700 / 15} color="bg-blue-3">
          {index + 1}
        </Circle>
        <p>{step}</p>
      </div>
    ))}
  </div>
)

export default CompanyInterestProcess
