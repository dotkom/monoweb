export default function InterestGroupsPage() {
    return (
        <div>
        <HobbygroupCard hobbyGroupName="Dagligvare" bannerColor="$blue3" />
        </div>
    )
}

import { Button, Card, Text} from "@dotkomonline/ui"
import { FC } from "react";
import Image from "next/image"
import { css, styled }from '@stitches/react'
import { Box, Flex} from "@components/primitives"

export interface HobbygroupCardProps { 
    logoURL?: string;
    //If no logoURL is provided, the logo becomes $blue2

    bannerColor?: string;
    bannerImageURL?: string;

    children?: React.ReactNode;
    linkToWiki?: string;
    hobbyGroupName: string;
}

const HobbygroupCard: FC<HobbygroupCardProps> = (props) => {
    const { logoURL, bannerColor, bannerImageURL, hobbyGroupName, children, linkToWiki, } = props
    return (
    <Card shadow className={styles.cardStyle()}>
        <Flex className={styles.bannerStyle()} css={{backgroundColor: `${bannerColor}`}}>
            {bannerImageURL && <Image src={bannerImageURL} fill object-fit="cover" alt={""} />}
            <Box className={styles.bannerImage()}>
                {
                logoURL ? 
                <img src={logoURL} className={styles.imageStyle()}/> :
                <Box css={{backgroundColor: "$blue3"}} className={styles.testBox()}/>
                }
            </Box>
        </Flex>
        <Flex className={styles.contentStyle()}>
            <Text className={styles.groupNameStyle()}>{hobbyGroupName}</Text>
            <Text className={styles.infoStyle()}>{children}</Text>
            <a href={linkToWiki} className={styles.noUnderline()}>
                <Button className={styles.button()}>
                    <Text>
                        Les mer
                    </Text>
                </Button>
            </a> {/** Consider adding support for languages */}
        </Flex>
    </Card>
    )
}


const BannerImage = styled(Image, {
    borderTopRightRadius: "$3",
    borderTopLeftRadius: "$3",
    backgroundColor: "$black",
  })

const styles = {
    imageStyle: css({
        borderRadius: "100px",
        width: "100px",
        height: "100px",
        border: "4px solid white",
        backgroundColor: "white",
    }),
    bannerStyle: css({
        position: "relative",
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: "$2",
        height: "80px",
    }),
    cardStyle: css({
        display: "grid",
        justifyContent: 'center',
        maxWidth: '310px',
        overflow: "hidden",
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