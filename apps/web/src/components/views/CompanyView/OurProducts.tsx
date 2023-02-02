import { css } from "@dotkomonline/ui"
import { Text } from "@dotkomonline/ui"

import BedpressIcon from "@components/icons/BedpressIcon"
import ItexIcon from "@components/icons/ItexIcon"
import OfflineIcon from "@components/icons/OfflineIcon"
import TechtalksIcon from "@components/icons/TechtalksIcon"
import UtlysningIcon from "@components/icons/UtlysningIcon"
import { Flex } from "@components/primitives"

const OurProducts = () => {
  return (
    <Flex css={{ justifyContent: "center", flexDirection: "column" }}>
      <Flex css={{ justifyContent: "space-evenly" }}>
        <Flex css={{ flexDirection: "column", textAlign: "center" }}>
          <Flex css={{ justifyContent: "center" }}>
            <ItexIcon className={styles.icon()} />
          </Flex>
          <Text className="font-bold">ITEX</Text>
        </Flex>
        <Flex css={{ flexDirection: "column", textAlign: "center" }}>
          <Flex css={{ justifyContent: "center" }}>
            <BedpressIcon className={styles.icon()} />
          </Flex>
          <Text className="font-bold">Bedriftsarrangement</Text>
        </Flex>
        <Flex css={{ flexDirection: "column", textAlign: "center" }}>
          <Flex css={{ justifyContent: "center" }}>
            <TechtalksIcon className={styles.icon()} />
          </Flex>
          <Text className="font-bold">Tech Talks</Text>
        </Flex>
      </Flex>
      <Flex css={{ justifyContent: "space-evenly" }}>
        <Flex css={{ flexDirection: "column", textAlign: "center" }}>
          <Flex css={{ justifyContent: "center" }}>
            <UtlysningIcon className={styles.icon()} />
          </Flex>
          <Text className="font-bold">Stillingsutlysning</Text>
        </Flex>
        <Flex css={{ flexDirection: "column", textAlign: "center" }}>
          <Flex css={{ justifyContent: "center" }}>
            <OfflineIcon className={styles.icon()} />
          </Flex>
          <Text className="font-bold">Annonse i Offline</Text>
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
