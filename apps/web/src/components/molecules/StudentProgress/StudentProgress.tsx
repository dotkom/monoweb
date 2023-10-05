interface IStudentProgressComponent {
  year: number
  id: number
}

interface IStudentProgress {
  year: number
}

const ProgressCircle: React.FC<IStudentProgressComponent> = ({ year, id }) => {
  return (
    <div
      className={`${year <= id ? "border-[#153e75]" : "border-[#36b37e]"} 
      flex h-[45px] w-[45px] items-center  justify-around rounded-[50%] border-[4px] border-solid`}
    >
      <div
        className={`${
          year < id ? "text-[#153e75]" : year == id ? "bg-[#153e75] text-white" : "bg-[#36b37e] text-white"
        } 
          h-[20px] w-[20px] rounded-[50%] text-center`}
      >
        {id}
      </div>
    </div>
  )
}

const HorizontalLine: React.FC<IStudentProgressComponent> = ({ year, id }) => {
  return <div className={`${year <= id ? "bg-[#153e75]" : "bg-[#36b37e]"} m-[-1px] h-[4px] w-[30px] self-center`} />
}

const VerticalLine: React.FC<IStudentProgressComponent> = ({ year, id }) => {
  return <div className={`${year <= id ? "bg-[#153e75]" : "bg-[#36b37e]"} z-10 h-[50px] w-[4px] self-center`} />
}

const StudentProgress: React.FC<IStudentProgress> = ({ year }) => {
  return (
    <>
      <div className="flex w-full items-center justify-between">
        <p>Studieløp</p>
        <div className="flex flex-row">
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
      <hr className="border-slate-12 my-5 w-full" />
    </>
  )
}

export default StudentProgress
