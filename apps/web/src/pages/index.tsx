import React from "react"
import { styled } from "@theme"
import { Button } from "@dotkom/ui"

const Home: React.FC = () => {
  return (
    <Box>
      <Button>Hello</Button>
    </Box>
  )
}

const Box = styled("div", {})

export default Home
