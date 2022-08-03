import { FC } from "react"
import Circle from "@components/atoms/Circle"
import type { CSS } from "@theme"
import { Box } from "@components/primitives"
interface CompanyInterestProcessProps {
  steps: string[]
}

const CompanyInterestProcess: FC<CompanyInterestProcessProps> = ({ steps }) => {
  return (
    <Box css={styles.step}>
      {steps.map((step, index) => (
        <Box key={step} css={styles.stepContainer}>
          <Circle size={700 / 15} color="$blue3">
            {index + 1}
          </Circle>
          <p>{step}</p>
        </Box>
      ))}
    </Box>
  )
}

const styles = {
  step: {
    maxWidth: "$lg",
    padding: "$4 $3",
    mx: "auto",
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr",
    "@maxLaptop": {
      gridTemplateColumns: "1fr 1fr",
      gridTemplateRows: "1fr 1fr",
    },
    "@maxTablet": {
      gridTemplateColumns: "1fr",
    },
  } as CSS,
  stepContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    margin: "$3 0",
    marginBottom: "$1",
  } as CSS,
}

export default CompanyInterestProcess
