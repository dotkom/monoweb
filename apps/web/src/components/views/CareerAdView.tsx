import { Box, Flex } from "../primitives"
import { FC } from "react"
import { Article } from "src/api/get-article"
import { CSS, css, styled } from "@theme"
import PortableText from "@components/molecules/PortableText"
import Image from "next/image"
import { DateTime } from "luxon"
import { Badge, Button, Text } from "@dotkom/ui"

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
        <Box
          css={{
            height: "80px",
            width: "100%",
          }}
        >
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

        <Text
          css={{
            margin: "0px",
            mt: "$3",
            borderBottom: "1px solid $gray8",
            pb: "$3",
          }}
        >
          -- ANDRE MULIGHETER
        </Text>
        <Text
          css={{
            margin: "0px",
            mt: "$3",
            borderBottom: "1px solid $gray8",
            pb: "$3",
          }}
        >
          -- Oslo
        </Text>
        <Text
          css={{
            margin: "0px",
            mt: "$3",
            borderBottom: "1px solid $gray8",
            pb: "$3",
          }}
        >
          -- Sommerjobb
        </Text>
        <Text
          css={{
            margin: "0px",
            mt: "$3",
            borderBottom: "1px solid $gray8",
            pb: "$3",
          }}
        >
          -- Backend
        </Text>
        <Box>Iconer</Box>

        <Button css={{ mt: "$3", width: "80px" }}>Søk</Button>
      </Box>

      <Box
        css={{
          width: "60%",
          mr: "5%",
        }}
      >
        <Box css={{ borderLeft: "1.5px solid $orange3", pl: "$4", ml: "50px" }}>
          <Text css={{ margin: "0", fontSize: "30px", fontWeight: "bold" }}>Bekk</Text>
          <Text css={{ margin: "0", fontSize: "20px" }}>Backend utvikler - Sommerjobb</Text>
        </Box>

        <Box css={{ borderLeft: "1.5px solid $orange3", pl: "$4", ml: "50px", mt: "$4" }}>
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

        <Box css={{ borderLeft: "1.5px solid $orange3", pl: "$4", ml: "50px", mt: "$4" }}>
          <Text css={{ fontWeight: "bold" }}>You will:</Text>
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

        <Box css={{ borderLeft: "1.5px solid $orange3", pl: "$4", ml: "50px", mt: "$4" }}>
          <Text css={{ fontWeight: "bold" }}>We´re looking for someone who has:</Text>
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
