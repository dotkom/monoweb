import { cn } from "@dotkomonline/ui"
import type { FC } from "react"

interface IStudentProgressComponent {
  year: number
  id: number
}

interface IStudentProgress {
  year: number
}

const ProgressCircle: FC<IStudentProgressComponent> = ({ year, id }) => {
  const yearClasses = cn({
    "text-[#153e75]": year < id,
    "bg-[#153e75] text-white": year === id,
    "bg-[#36b37e] text-white": year > id,
  })
  return (
    <div
      className={cn(
        year <= id ? "border-[#153e75]" : "border-[#36b37e]",
        "flex h-[45px] w-[45px] items-center justify-around rounded-[50%]  border-[4px] border-solid max-sm:h-[30px] max-sm:w-[30px]"
      )}
    >
      <div
        className={cn(
          yearClasses,
          "flex h-[20px] w-[20px] justify-center rounded-[50%] max-sm:h-[10px] max-sm:w-[10px] max-sm:items-center max-sm:p-2 max-sm:text-center"
        )}
      >
        <p className="max-sm:text-[1rem]">{id}</p>
      </div>
    </div>
  )
}

const HorizontalLine: FC<IStudentProgressComponent> = ({ year, id }) => (
  <div
    className={cn(
      year <= id ? "bg-[#153e75]" : "bg-[#36b37e]",
      "m-[-1px] h-[4px] w-[30px] self-center max-sm:w-[20px]"
    )}
  />
)

const VerticalLine: FC<IStudentProgressComponent> = ({ year, id }) => (
  <div
    className={cn(year <= id ? "bg-[#153e75]" : "bg-[#36b37e]", "z-10 h-10 w-1 self-center sm:h-[50px] sm:w-[4px]")}
  />
)

const StudentProgress: FC<IStudentProgress> = ({ year }) => (
  <div className="justify-evenl flex items-center">
    <div className="relative flex flex-row items-center">
      <ProgressCircle year={year} id={1} />
      <HorizontalLine year={year} id={1} />
      <ProgressCircle year={year} id={2} />
      <HorizontalLine year={year} id={2} />
      <ProgressCircle year={year} id={3} />
      <HorizontalLine year={year} id={3} />
      <VerticalLine year={year} id={3} />
      <HorizontalLine year={year} id={4} />
      <ProgressCircle year={year} id={4} />
      <HorizontalLine year={year} id={5} />
      <ProgressCircle year={year} id={5} />
    </div>
  </div>
)

export default StudentProgress
