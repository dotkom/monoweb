import { InterestGroup } from "@/api/get-interestgroups";
import InterestgroupCard from "@/components/molecules/InterestgroupCard";
import { FC } from "react";

interface InterestGroupsViewProps {
    interestgroups: InterestGroup[]
}

export const InterestgroupView: FC<InterestGroupsViewProps> = (props: InterestGroupsViewProps) => {

    const { interestgroups } = props

    return (
        <div className="pb-10">
            <div id="topbanner" className="grid justify-items-center p-20 bg-green-7">
                <h1 className="text-4xl font-bold text-blue-1 z-10">Interessegrupper</h1>
                <div className="w-64 h-3 rounded-xl bg-green-10 relative -top-2"></div>
            </div>

            <div className="flex flex-col items-center p-7 text-center">
                <h2 className="text-2xl font-medium dark:text-white">
                    Hvordan søke om støtte til din interessegruppe?
                </h2>
                <p className="w-96 p-5 dark:text-white">Du kan søke om økonomisk støtte til din interessegruppe ved å sende en mail til seniorkom@online.ntnu.no</p>
                <p className="dark:text-white">Mer informasjon om hvordan dette gjøres finnes her.</p>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
                {interestgroups?.map((interestgroup) => {
                    return (
                        <div>

                            <InterestgroupCard
                            interestgroupName={interestgroup.interestgroup_name} 
                            logoURL={interestgroup.logo_url?.asset?.url}
                            // logoURL={interestgroup.logo_url}
                            bannerImageURL={interestgroup.bannerimage_url?.asset?.url}
                            bannerColor={interestgroup.bannercolor?.hex}
                            >
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
    
