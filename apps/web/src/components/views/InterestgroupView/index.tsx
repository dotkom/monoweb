import InterestgroupCard from "@/components/molecules/InterestgroupCard";
import { BlockContentProps } from "@sanity/block-content-to-react";
import { FC } from "react";


export type Content = BlockContentProps["blocks"]

interface InterestgroupViewProps {
    interestgroupContent: Content[]
}

export const InterestgroupView: FC<InterestgroupViewProps> = (props: InterestgroupViewProps) => {

    const interestgroups = props.interestgroupContent
    console.log(interestgroups)

    

    return (
        <div className="pb-3">
            <div className="flex justify-center p-20 bg-green-12">
                <h1 className="text-4xl font-bold text-center text-blue-1">Interessegrupper</h1>
            </div>
            <div className="flex flex-col items-center p-7 text-center">
                <h2 className="text-2xl font-medium text-blue-1">
                    Hvordan søke om støtte til din interessegruppe?
                </h2>
                <p className="w-96 p-5 text-blue-1">Du kan søke om økonomisk støtte til din interessegruppe ved å sende en mail til seniorkom@online.ntnu.no</p>
                <p className="text-blue-1">Mer informasjon om hvordan dette gjøres finnes her.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
                {interestgroups.map((interestgroup) => {
                    return (
                        <InterestgroupCard 
                        interestgroupName={interestgroup.interestgroup_name} 
                        bannerColor="gray">
                            {interestgroup.interestgroup_description}
                        </InterestgroupCard>
                    )
                })
                }
            </div>
        </div>
    )
}
    
