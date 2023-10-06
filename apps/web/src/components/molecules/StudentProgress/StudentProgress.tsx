interface IStudentProgressComponent {
  id: number;
  year: number;
}

interface IStudentProgress {
  year: number;
}

const ProgressCircle: React.FC<IStudentProgressComponent> = ({ id, year }) => (
  <div
    className={`${year <= id ? "border-[#153e75]" : "border-[#36b37e]"} 
      flex h-[45px] w-[45px] items-center  justify-around rounded-[50%] border-[4px] border-solid`}
  >
    <div
      className={`${year < id ? "text-[#153e75]" : year === id ? "bg-[#153e75] text-white" : "bg-[#36b37e] text-white"} 
          h-[20px] w-[20px] rounded-[50%] text-center`}
    >
      {id}
    </div>
  </div>
);

const HorizontalLine: React.FC<IStudentProgressComponent> = ({ id, year }) => (
  <div className={`${year <= id ? "bg-[#153e75]" : "bg-[#36b37e]"} m-[-1px] h-[4px] w-[30px] self-center`} />
);

const VerticalLine: React.FC<IStudentProgressComponent> = ({ id, year }) => (
  <div className={`${year <= id ? "bg-[#153e75]" : "bg-[#36b37e]"} z-10 h-[50px] w-[4px] self-center`} />
);

const StudentProgress: React.FC<IStudentProgress> = ({ year }) => (
  <>
    <div className="flex w-full items-center justify-between">
      <p>Studieløp</p>
      <div className="flex flex-row">
        <ProgressCircle id={1} year={year} />
        <HorizontalLine id={1} year={year} />
        <ProgressCircle id={2} year={year} />
        <HorizontalLine id={2} year={year} />
        <ProgressCircle id={3} year={year} />
        <HorizontalLine id={3} year={year} />
        <VerticalLine id={3} year={year} />
        <HorizontalLine id={4} year={year} />
        <ProgressCircle id={4} year={year} />
        <HorizontalLine id={5} year={year} />
        <ProgressCircle id={5} year={year} />
      </div>
    </div>
    <hr className="border-slate-12 my-5 w-full" />
  </>
);

export default StudentProgress;
