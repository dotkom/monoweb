import { css } from "@dotkomonline/ui"
import { Flex } from "@components/primitives"
import BedpressIcon from "@components/icons/BedpressIcon"
import ItexIcon from "@components/icons/ItexIcon"
import OfflineIcon from "@components/icons/OfflineIcon"
import UtlysningIcon from "@components/icons/UtlysningIcon"
import TechtalksIcon from "@components/icons/TechtalksIcon"
import { Text } from "@dotkomonline/ui"

const OurProducts = () => {
  return (
    <Flex css={{ justifyContent: "center", flexDirection: "column" }}>
      <Flex css={{ justifyContent: "space-evenly" }}>
        <Flex css={{ flexDirection: "column", textAlign: "center" }}>
          <Flex css={{ justifyContent: "center" }}>
            <ItexIcon className={styles.icon()} />
          </Flex>
          <Text css={{ fontWeight: "bold" }}>ITEX</Text>
        </Flex>
        <Flex css={{ flexDirection: "column", textAlign: "center" }}>
          <Flex css={{ justifyContent: "center" }}>
            <BedpressIcon className={styles.icon()} />
          </Flex>
          <Text css={{ fontWeight: "bold" }}>Bedriftsarrangement</Text>
        </Flex>
        <Flex css={{ flexDirection: "column", textAlign: "center" }}>
          <Flex css={{ justifyContent: "center" }}>
            <TechtalksIcon className={styles.icon()} />
          </Flex>
          <Text css={{ fontWeight: "bold" }}>Tech Talks</Text>
        </Flex>
      </Flex>
      <Flex css={{ justifyContent: "space-evenly" }}>
        <Flex css={{ flexDirection: "column", textAlign: "center" }}>
          <Flex css={{ justifyContent: "center" }}>
            <UtlysningIcon className={styles.icon()} />
          </Flex>
          <Text css={{ fontWeight: "bold" }}>Stillingsutlysning</Text>
        </Flex>
        <Flex css={{ flexDirection: "column", textAlign: "center" }}>
          <Flex css={{ justifyContent: "center" }}>
            <OfflineIcon className={styles.icon()} />
          </Flex>
          <Text css={{ fontWeight: "bold" }}>Annonse i Offline</Text>
        </Flex>
      </Flex>
    </Flex>
  )
}

const styles = {
  icon: css({
    "@bp1": {
      width: "50px",
      height: "50px",
    },
    "@bp2": {
      width: "75px",
      height: "75px",
    },
    "@bp3": {
      width: "100px",
      height: "100px",
    },
  }),
}

export default OurProducts
