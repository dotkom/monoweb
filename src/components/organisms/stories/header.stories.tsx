/** @jsxImportSource theme-ui */

import { CompanyHeader } from "../companies/CompanyHeader";

export default {
  title: "organisms/company/Header",
  component: "Header",
};

const content = [
  {
    _key: "d634596165d1",
    _type: "block",
    children: [
      { _key: "9fe54971a702", _type: "span", marks: [], text: "Er din bedrift på jakt etter skarpe IT-studenter?" },
    ],
    markDefs: [],
    style: "h1",
  },
  {
    _key: "0baf27ff9c6b",
    _type: "block",
    children: [
      {
        _key: "f0aa340feb8b",
        _type: "span",
        marks: [],
        text: "Online er en linjeforening for Informatikkstudentene ved NTNU Gløshaugen. Informatikkstudiet hører til Institutt for datateknologi og informatikk (IDI). Dette innebærer blant annet å lære om utvikling, forbedring, evaluering og bruk av datasystemer. For mer informasjon om studiet, se NTNU sine offisielle nettsider for bachelor og master.",
      },
    ],
    markDefs: [],
    style: "normal",
  },
];

export const Header = () => {
  return <CompanyHeader props={content} />;
};
