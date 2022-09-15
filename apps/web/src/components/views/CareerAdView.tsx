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
        mt: "$5",
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
            height: "100px",
            width: "100%",
          }}
        >
          <Text
            css={{
              margin: "0px",
              fontSize: "75px",
              textAlign: "center",
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
          bg: "$blue5",
          width: "60%",
          mt: "20px",
          mr: "5%",
        }}
      >
        Test
      </Box>
    </Flex>
  )
}
