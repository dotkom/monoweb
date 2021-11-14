import PortableText from "react-portable-text";
import { Box, Heading, Text, Button } from "theme-ui";

const content = [
  {
    _key: "917cdeeca44d",
    _type: "block",
    children: [
      { _key: "6445bd9121fb", _type: "span", marks: [], text: "Bruk Onlines interesseskjema for å melde interesse" },
    ],
    markDefs: [],
    style: "h2",
  },
  {
    _key: "dc4591576fc9",
    _type: "block",
    children: [
      {
        _key: "55f7f19e986a",
        _type: "span",
        marks: [],
        text: "Bedriftens svar vil bli sendt til Onlines bedriftskomite og etterstrebes å bli svart på innen to virkedager.\n",
      },
    ],
    markDefs: [],
    style: "normal",
  },
];

export const CompanyInterestForm = () => {
  return (
    <Box
      sx={{
        width: "60%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        alignSelf: "center",
        marginTop: "5vh",
      }}
    >
      <Box>
        <PortableText
          content={content}
          className="companyInterest"
          serializers={{
            h2: (content) => (
              <Heading sx={{ color: "gray.1", fontSize: 32, marginBottom: "3vh", textAlign: "center" }} {...content} />
            ),
            //this does not work atm -- --
            normal: ({ children }) => <Text sx={{ fontSize: "12px", color: "black.1" }}>{children}</Text>,
          }}
        ></PortableText>
      </Box>
      <Button sx={{ marginTop: "5vh" }}>Send Interesse</Button>
    </Box>
  );
};
