interface IStudentProgress {
    year: number
}

const StudentProgress: React.FC<IStudentProgress> = ({year}) => {
        return (
            <>
                <div className="flex w-full items-center justify-between">
                    <p>Studieløp</p>
                    <div className="flex flex-row">
                        <div className={`${year <= 0 ? "border-[#153e75]" : "border-[#36b37e]"} w-[45px] h-[45px] border-[5px] border-solid rounded-[50%] flex justify-around items-center`}>
                            <div className={`${year <= 0 ? "bg-[#153e75]" : "bg-[#36b37e]"} w-[20px] h-[20px] rounded-[50%] text-center`}>1</div>
                        </div>
                        <div className={`${year <= 0 ? "bg-[#153e75]" : "bg-[#36b37e]"} w-[30px] h-[5px] self-center m-[-1px]`}></div>
                        <div className={`${year <= 1 ? "border-[#153e75]" : "border-[#36b37e]"} w-[45px] h-[45px] border-[5px] border-solid rounded-[50%] flex justify-around items-center`}>
                            <div className={`${year <= 1 ? "bg-[#153e75]" : "bg-[#36b37e]"} w-[20px] h-[20px] rounded-[50%] text-center`}>2</div>
                        </div>
                        <div className={`${year <= 1 ? "bg-[#153e75]" : "bg-[#36b37e]"} w-[30px] h-[5px] self-center m-[-1px]`}></div>
                        <div className={`${year <= 2 ? "border-[#153e75]" : "border-[#36b37e]"} w-[45px] h-[45px] border-[5px] border-solid rounded-[50%] flex justify-around items-center`}>
                            <div className={`${year <= 2 ? "bg-[#153e75]" : "bg-[#36b37e]"} w-[20px] h-[20px] rounded-[50%] text-center`}>3</div>
                        </div>
                        <div className={`${year <= 2 ? "bg-[#153e75]" : "bg-[#36b37e]"} w-[30px] h-[5px] self-center m-[-1px]`}></div>
                        <div className={`${year <= 2 ? "bg-[#153e75]" : "bg-[#36b37e]"} w-[5px] h-[50px] self-center z-10`}></div>
                        <div className={`${year <= 3 ? "bg-[#153e75]" : "bg-[#36b37e]"} w-[30px] h-[5px] self-center m-[-1px]`}></div>
                        <div className={`${year <= 3 ? "border-[#153e75]" : "border-[#36b37e]"} w-[45px] h-[45px] border-[5px] border-solid rounded-[50%] flex justify-around items-center`}>
                            <div className={`${year <= 3 ? "bg-[#153e75]" : "bg-[#36b37e]"} w-[20px] h-[20px] rounded-[50%] text-center`}>4</div>
                        </div>
                        <div className={`${year <= 4 ? "bg-[#153e75]" : "bg-[#36b37e]"} w-[30px] h-[5px] self-center m-[-1px]`}></div>
                        <div className={`${year <= 4 ? "border-[#153e75]" : "border-[#36b37e]"} w-[45px] h-[45px] border-[5px] border-solid  rounded-[50%] flex justify-around items-center`}>
                            <div className={`${year <= 4 ? "bg-[#153e75]" : "bg-[#36b37e]"} w-[20px] h-[20px] rounded-[50%] text-center`}>5</div>
                        </div>
                    </div>
                </div>
                <hr className="border-slate-12 my-5 w-full" />
            </>
        )
}

export default StudentProgress