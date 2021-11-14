/** @jsxImportSource theme-ui */

import { Text, TextProps, Heading, Box } from "@theme-ui/components";

export default {
  title: "organisms/company/Products",
  component: "Products",
};

export const Products = (props: TextProps) => {
  return (
    <Box
      sx={{
        width: "60%",
        display: "flex",
        flexDirection: "column",
        alignSelf: "center",
        alignItems: "center",
      }}
    >
      <Heading>Våre Produkter</Heading>
      <Text>
        I samarbeid med næringslivet tilbyr vi forskjellige produkter for å gi studentene våre en bredere og dypere
        fagkunnskap samt et innblikk i hverdagen til aktuelle arbeidsplasser.
      </Text>
    </Box>
  );
};
