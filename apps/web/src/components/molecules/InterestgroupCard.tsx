import { Button, Text} from "@dotkomonline/ui"
import { FC } from "react";
import Image from "next/image"

interface InterestgroupProps { 
    logoURL?: string;

    bannerColor?: string;
    bannerImageURL?: string;

    children?: React.ReactNode;
    linkToWiki?: string;
    interestgroupName: string;
}

const Interestgroup: FC<InterestgroupProps> = (props) => {
    const { logoURL, bannerImageURL, bannerColor, interestgroupName, children, linkToWiki } = props
    let bannerColorSel = `bg-[${bannerColor}]` 
    return (
    <div className="flex rounded-xl flex-col max-w-sm h-full overflow-hidden bg-blue-4">
        {/* <Flex className="grid justify-center mb-6" css={{backgroundColor: `${bannerColor}`}}> */}

        <div className={`grid justify-center mb-10 bg-blue-6 ${bannerColorSel}`}         
        style={{backgroundImage: `url(${bannerImageURL})`}}>
            {/* todo: fix banner image styling */}
            <div className="relative top-12">
                {
                logoURL ? 
                <img src={logoURL} className="rounded-full w-32 h-32 border-8 bg-[#FFFFFF] border-[#FFFFFF] flex"/> :
                <div className="rounded-full w-32 h-32 flex bg-[#FFFFFF]"/>
                }
                
            </div>
        </div>
        <div className="flex flex-col justify-between h-full text-center py-6 px-3">
            <div className="">
                <Text className="mb-0 text-2xl font-bold">{interestgroupName}</Text>
                <Text className="mt-0 m-4">{children}</Text>
            </div>
            <a href={linkToWiki} className="">
                <Button color="blue">
                    <Text className="text-white" >
                        Les mer
                    </Text>
                </Button>
            </a>
        </div>
    </div>
    )
}


export default Interestgroup