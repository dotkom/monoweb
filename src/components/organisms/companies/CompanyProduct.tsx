import { Text, Heading, Box } from "@theme-ui/components";

export const CompanyProducts = () => {
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
      <Heading sx={{ fontSize: 32, fontWeight: "bold", color: "gray.1", marginTop: "4vh ", marginBottom: "3vh" }}>
        Våre Produkter
      </Heading>
      <Text sx={{ fontSize: 14, width: "65%" }}>
        I samarbeid med næringslivet tilbyr vi forskjellige produkter for å gi studentene våre en bredere og dypere
        fagkunnskap samt et innblikk i hverdagen til aktuelle arbeidsplasser.
      </Text>
    </Box>
  );
};
