import { CareerProps } from "@/pages/career"
import { FC } from "react"
import CompanyAdListItem from "../molecules/CompanyAdListItem"
import { Box, Flex } from "../primitives"
import { CSS, css, styled } from "@theme"
import { Text } from "@dotkom/ui"

const CareerView: FC<CareerProps> = (props: CareerProps) => {
  return (
    <Box>
      <Box css={{ width: "100%", backgroundColor: "$orange12" }}>
        <CareerBanner>
          <Text css={styles.bannerTitle}>
            Er du på jakt etter <span className={styles.yellowUnderline()}>jobb</span>?
          </Text>
          <Text css={styles.bannerText}>
            Bedrifter betaler 15 000 for å være med på denne lista så pls søk eller så får ikke Online penger uwu
          </Text>
        </CareerBanner>
      </Box>
      <CareerContainer>
        <TableHead>
          <ColumnTitle>Bedrift</ColumnTitle>
          <ColumnTitle>Rolle</ColumnTitle>
          <ColumnTitle>Sted</ColumnTitle>
          <ColumnTitle>Frist</ColumnTitle>
        </TableHead>
        <TableContent>
          {props.careers.map((c) => (
            <CompanyAdListItem career={c} />
          ))}
        </TableContent>
      </CareerContainer>
    </Box>
  )
}

const styles = {
  bannerTitle: {
    color: "$gray1",
    fontSize: "$4xl",
    fontWeight: "$bold",
    lineHeight: "1.4",
    marginTop: "$5",
  } as CSS,
  yellowUnderline: css({
    backgroundImage: 'url("/for-company-text-decor.svg")',
    backgroundRepeat: "no-repeat",
    backgroundPosition: "50% 88%",
  }),
  tableHead: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr) 150px",
    borderBottom: "2px solid $gray11",
    paddingLeft: "$2",
  } as CSS,
  bannerText: {
    color: "$gray1",
    fontSize: "$2xl",
    fontWeight: "$bold",
    lineHeight: "1.4",
  } as CSS,
  tableContent: {
    flexDirection: "column",
  } as CSS,
  careerContainer: {
    margin: "$4 auto",
    maxWidth: "$lg",
  } as CSS,
  colTitle: {
    fontSize: "$xl",
    fontWeight: "$medium",
    marginBottom: "$2",
  } as CSS,
  careerBanner: {
    height: "200px",
    textAlign: "center",
    margin: "auto",
    padding: "$5",
    maxWidth: "$md",
  },
}

const TableHead = styled(Box, styles.tableHead)
const TableContent = styled(Flex, styles.tableContent)
const CareerContainer = styled(Box, styles.careerContainer)
const ColumnTitle = styled(Text, styles.colTitle)
const CareerBanner = styled(Box, styles.careerBanner)

export default CareerView
