import { FC } from "react";
import StudentProgress from "../StudentProgress/StudentProgress";

type StudyProgressionBoxProps = {
    className?: string;
}

const StudyProgressionBox: FC<StudyProgressionBoxProps> = ({ className }) => {
    // TODO: Implement dynamic way of getting grade
    const startYear = 2022;
    const grade = 3;


    return (
        <div className={`flex flex-col items-center justify-center gap-3 ${className ?? ''}`}>
            <p>{grade}. klasse</p>
            <p>Studiesett: {startYear}</p>
            <div className="transform scale-90">
                <StudentProgress year={grade} />  
            </div>
        </div>
    )
}

export default StudyProgressionBox;