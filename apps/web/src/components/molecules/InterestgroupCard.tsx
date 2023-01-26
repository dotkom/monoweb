import { Button, Card, Text} from "@dotkomonline/ui"
import { FC } from "react";
import Image from "next/image"
import { css, styled }from '@stitches/react'
import { Box, Flex} from "@components/primitives"

interface InterestgroupProps { 
    logoURL?: string;
    //If no logoURL is provided, the logo becomes $blue2

    bannerColor?: string;
    bannerImageURL?: string;

    children?: React.ReactNode;
    linkToWiki?: string;
    interestgroupName: string;
}

const Interestgroup: FC<InterestgroupProps> = (props) => {
    const { logoURL, bannerColor, bannerImageURL, interestgroupName, children, linkToWiki } = props
    return (
    <Box className="flex rounded-xl flex-col max-w-sm overflow-hidden bg-blue-3">
        <Flex className="grid justify-center mb-6" css={{backgroundColor: `${bannerColor}`}}>
            {bannerImageURL && <Image src={bannerImageURL} fill object-fit="cover" alt={""} />}
            <Box className={styles.bannerImage()}>
                {
                logoURL ? 
                <img src={logoURL} className="rounded-full"/> :
                <Box className="rounded-full w-24 h-24 flex bg-foreground"/>
                }
            </Box>
        </Flex>
        <div className="flex flex-col justify-between h-full text-center py-6 px-3">
            <div className="">
                <Text className={styles.groupNameStyle()}>{interestgroupName}</Text>
                <Text className={styles.infoStyle()}>{children}</Text>
            </div>
            <a href={linkToWiki} className="">
                <Button className="">
                    <Text>
                        Les mer
                    </Text>
                </Button>
            </a>
        </div>
    </Box>
    )
}


const styles = {
    bannerStyle: css({
        position: "relative",
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: "$2",
        height: "80px",
    }),
    contentStyle: css({
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        padding: '20px',
    }),
    groupNameStyle: css({
        marginBottom: '0px',
        fontSize: "$2xl",
        fontWeight: "bold",
    }),
    infoStyle: css({
        marginTop: '0px',
        margin: '15px',
    }),
    testBox: css({
        width: "100px",
        height: "100px",
        borderRadius: "100px",
        border: "4px solid white",
    }),
    bannerImage: css({
        //move 50px down
        position: "relative",
        top: "35px",
    }),
    button: css({
        height: "30px",
        marginTop: "$2",
    }),
    noUnderline: css({
        textDecoration: "none",
    })
}

export default Interestgroup