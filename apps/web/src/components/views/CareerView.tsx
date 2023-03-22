import { CareerProps } from "@/pages/career"
import { FC } from "react"
// import CompanyAdListItem from "../molecules/CompanyAdListItem"

const CareerView: FC<CareerProps> = (props: CareerProps) => {

  // return <div> 404 Siden finnes ikke </div>

  return (
    <div>

      {/* css={{ width: "100%", backgroundColor: "$orange12" }} */}
      <div>

        {/* CareerBanner */}
        <div>
          {/* p: css={styles.bannerTitle} */}
          {/* span: className={styles.yellowUnderline()} */}
          <p>
            Er du på jakt etter <span>jobb</span>?
          </p>
          {/*  css={styles.bannerText} */}
          <p>
            Bedrifter betaler 15 000 for å være med på denne lista så pls søk eller så får ikke Online penger uwu
          </p>
        </div>
      </div>
      {/* CareerContainer */}
      <div>
        {/* TableHead */}
        <div>
          {/* ColumnTitle 4x */}
          <p>Bedrift</p>
          <p>Rolle</p>
          <p>Sted</p>
          <p>Frist</p>
        </div>
        {/* TableContent */}
        <div>
          {props.careers.map((c) => (
            // <CompanyAdListItem career={c} />
            <></>
          ))}
        </div>
      </div>
    </div>
  )
}

// const styles = {
//   bannerTitle: {
//     color: "$gray1",
//     fontSize: "$4xl",
//     fontWeight: "$bold",
//     lineHeight: "1.4",
//     marginTop: "$5",
//   } as CSS,
//   yellowUnderline: css({
//     backgroundImage: 'url("/for-company-text-decor.svg")',
//     backgroundRepeat: "no-repeat",
//     backgroundPosition: "50% 88%",
//   }),
//   tableHead: {
//     display: "grid",
//     gridTemplateColumns: "repeat(3, 1fr) 150px",
//     borderBottom: "2px solid $gray11",
//     paddingLeft: "$2",
//   } as CSS,
//   bannerText: {
//     color: "$gray1",
//     fontSize: "$2xl",
//     fontWeight: "$bold",
//     lineHeight: "1.4",
//   } as CSS,
//   tableContent: {
//     flexDirection: "column",
//   } as CSS,
//   careerContainer: {
//     margin: "$4 auto",
//     maxWidth: "$lg",
//   } as CSS,
//   colTitle: {
//     fontSize: "$xl",
//     fontWeight: "$medium",
//     marginBottom: "$2",
//   } as CSS,
//   careerBanner: {
//     height: "200px",
//     textAlign: "center",
//     margin: "auto",
//     padding: "$5",
//     maxWidth: "$md",
//   },
// }

// const TableHead = styled(Box, styles.tableHead)
// const TableContent = styled(Flex, styles.tableContent)
// const CareerContainer = styled(Box, styles.careerContainer)
// const ColumnTitle = styled(Text, styles.colTitle)
// const CareerBanner = styled(Box, styles.careerBanner)

export default CareerView
