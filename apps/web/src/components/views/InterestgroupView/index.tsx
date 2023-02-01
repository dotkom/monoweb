import InterestgroupCard from "@/components/molecules/InterestgroupCard";
import { BlockContentProps } from "@sanity/block-content-to-react";
import { FC } from "react";
import { Box } from "@/components/primitives";


export type Content = BlockContentProps["blocks"]

interface InterestgroupViewProps {
    interestgroupContent: Content[]
}

export const InterestgroupView: FC<InterestgroupViewProps> = (props: InterestgroupViewProps) => {

    const interestgroups = props.interestgroupContent
    console.log(interestgroups)

    return (
        <div className="pb-3">

            <div className="grid justify-items-center p-20 bg-green-12">
                <h1 className="text-4xl font-bold text-blue-1 z-10">Interessegrupper</h1>
                <Box className="w-64 h-3 rounded-xl bg-green-10 relative -top-2"></Box>
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
                        <div>

                            <InterestgroupCard 
                            interestgroupName={interestgroup.interestgroup_name} 
                            logoURL={interestgroup.logo_url}
                            bannerImageURL={interestgroup.bannerimage_url}
                            bannerColor="gray">
                                {interestgroup.interestgroup_description}
                            </InterestgroupCard>

                        </div>
                    )
                })
                }
            </div>
        </div>
    )
}
    
