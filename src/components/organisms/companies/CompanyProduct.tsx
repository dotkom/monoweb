import { Text, Heading, Box } from "@theme-ui/components";
import React from "react";
import PortableText from "react-portable-text";

const content = [
  {
    _key: "2782a2850138",
    _type: "block",
    children: [{ _key: "1e7a4bd44633", _type: "span", marks: [], text: "Våre Produkter" }],
    markDefs: [],
    style: "h2",
  },
  {
    _key: "9a9cb0a4d85a",
    _type: "block",
    children: [
      {
        _key: "620c458df231",
        _type: "span",
        marks: [],
        text: "I samarbeid med næringslivet tilbyr vi forskjellige produkter for å gi studentene våre en bredere og dypere fagkunnskap samt et innblikk i hverdagen til aktuelle arbeidsplasser.",
      },
    ],
    markDefs: [],
    style: "normal",
  },
];
export const CompanyProducts = (props) => {
  const content = props.content.content;
  return (
    <Box
      sx={{
        maxWidth: "40%",
        display: "flex",
        flexDirection: "column",
        alignSelf: "center",
        alignItems: "center",
        margin: "auto",
      }}
    >
      <PortableText
        content={content}
        className="companyInterest"
        serializers={{
          h2: (content) => (
            <Heading
              sx={{
                color: "gray.1",
                fontSize: 32,
                fontWeight: "bold",
                marginBottom: "3vh",
                marginTop: "4vh ",
                textAlign: "center",
              }}
              {...content}
            />
          ),
          //this does not work atm -- --
          normal: ({ children }) => <Text sx={{ fontSize: "14px" }}>{children}</Text>,
        }}
      ></PortableText>
    </Box>
  );
};
