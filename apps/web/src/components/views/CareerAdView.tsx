import { Box, Flex } from "../primitives"
import { CSS } from "@theme"
import PortableText from "@components/molecules/PortableText"
import Image from "next/image"
import { DateTime } from "luxon"
import { Badge, Button, Text } from "@dotkom/ui"
import { IoEarth, IoTimeOutline, IoCopyOutline, IoArrowBackOutline } from "react-icons/io5"
import { BsLinkedin } from "react-icons/bs"

const block = ["<h1>TESSSTTT</h1>", "<Text>TESSSTTT</Text>"]

export const CareerAdView = () => {
  return (
    <Flex
      css={{
        mt: "100px",
        justifyContent: "space-around",
      }}
    >
      <Box
        css={{
          width: "22%",
          ml: "8%",
        }}
      >
        <Box>
          <Text
            css={{
              margin: "0px",
              fontSize: "50px",
              textAlign: "center",
              bg: "$gray11",
            }}
          >
            Bekk
          </Text>
        </Box>
        <Text>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl ut aliquam aliquam, nunc nisi
          condimentum nunc, eget lacinia nisl lorem eget nunc. Sed euismod, nisl ut aliquam aliquam, nunc nisi
          condimentum nunc, eget lacinia nisl lorem eget nunc. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          Sed euismod, nisl ut aliquam aliquam, nunc nisi
        </Text>

        <Box
          css={{
            my: "$4",
            mx: "auto",
            width: "80%",
            border: "0.5px solid black",
          }}
        />

        <Text css={styles.info}>
          <IoArrowBackOutline /> ANDRE MULIGHETER
        </Text>
        <Text css={styles.info}>
          <IoEarth /> Oslo
        </Text>
        <Text css={styles.info}>
          <IoTimeOutline /> Sommerjobb
        </Text>
        <Text css={styles.info}>
          <IoCopyOutline /> Backend
        </Text>

        <Box>
          <BsLinkedin />
        </Box>

        <Button css={{ mt: "$3", width: "80px" }}>Søk</Button>
      </Box>

      <Box
        css={{
          width: "60%",
          mr: "5%",
        }}
      >
        <Box css={styles.article}>
          <Text css={{ margin: "0", fontSize: "30px" }}>
            <b>Bekk</b>
          </Text>
          <Text css={{ margin: "0", fontSize: "20px" }}>Backend utvikler - Sommerjobb</Text>
        </Box>

        <PortableText blocks={block} />

        <Box css={styles.article}>
          <Text>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl ut aliquam aliquam, nunc nisi
            condimentum nunc, eget lacinia nisl lorem eget nunc. Sed euismod, nisl ut aliquam aliquam, nisl ut aliquam
            aliquam, nunc nisi condimentum nunc, eget lacinia nisl lorem eget nunc. Lorem ipsum dolor sit amet,
            consectetur adipiscing elit. Sed euismod, nisl ut aliquam aliquam, nunc nisi Lorem ipsum dolor sit amet,
            consectetur adipiscing elit. Sed euismod, nisl ut aliquam aliquam, nunc nisi condimentum nunc, eget lacinia
            nisl lorem eget nunc. Sed euismod, nisl ut aliquam aliquam, nisl ut aliquam aliquam, nunc nisi condimentum
            nunc, eget lacinia nisl lorem eget nunc. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
            euismod, nisl ut aliquam aliquam, nunc nisi
            <br />
            <br />
            lorem eget nunc. Sed euismod, nisl ut aliquam aliquam, nisl ut aliquam aliquam, nunc nisi condimentum nunc,
            eget lacinia nisl lorem eget nunc. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod,
            nisl
          </Text>
        </Box>

        <Box css={styles.article}>
          <Text>
            <b>You will:</b>
          </Text>
          <ul>
            <li>
              <Text>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl ut aliquam aliquam, nunc nisi
                condimentum nunc, eget lacinia nisl lorem eget nunc. Sed{" "}
              </Text>
            </li>
            <li>
              <Text>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl ut aliquam aliquam, nunc nisi
                condimentum nunc, eget lacinia nisl lorem eget nunc. Sed{" "}
              </Text>
            </li>
            <li>
              <Text>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl ut aliquam aliquam, nunc nisi
                condimentum nunc, eget lacinia nisl lorem eget nunc. Sed{" "}
              </Text>
            </li>
            <li>
              <Text>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl ut aliquam aliquam, nunc nisi
                condimentum nunc, eget lacinia nisl lorem eget nunc. Sed{" "}
              </Text>
            </li>
          </ul>
        </Box>

        <Box css={styles.article}>
          <Text>
            <b>We´re looking for someone who has:</b>
          </Text>
          <ul>
            <li>
              <Text>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl ut aliquam aliquam, nunc nisi
                condimentum nunc, eget lacinia nisl lorem eget nunc. Sed{" "}
              </Text>
            </li>
            <li>
              <Text>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl ut aliquam aliquam, nunc nisi
                condimentum nunc, eget lacinia nisl lorem eget nunc. Sed{" "}
              </Text>
            </li>
            <li>
              <Text>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl ut aliquam aliquam, nunc nisi
                condimentum nunc, eget lacinia nisl lorem eget nunc. Sed{" "}
              </Text>
            </li>
            <li>
              <Text>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl ut aliquam aliquam, nunc nisi
                condimentum nunc, eget lacinia nisl lorem eget nunc. Sed{" "}
              </Text>
            </li>
          </ul>
        </Box>
      </Box>
    </Flex>
  )
}

const styles = {
  article: {
    borderLeft: "1.5px solid $orange3",
    pl: "$4",
    ml: "50px",
    mt: "$4",
  } as CSS,
  info: {
    margin: "0px",
    mt: "$3",
    borderBottom: "1px solid $gray8",
    pb: "$3",
  } as CSS,
}
