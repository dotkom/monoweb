/** @jsxImportSource theme-ui */

import { CompanyInfo } from "../companies/CompanyInfo";

export default {
  title: "organisms/company/Info",
  component: "Info",
};

const content = [
  {
    _key: "5d1be81a0fdf",
    _type: "block",
    children: [{ _key: "155f6f97751d", _type: "span", marks: [], text: "Techtalks" }],
    markDefs: [],
    style: "h2",
  },
  {
    _key: "413257a02641",
    _type: "block",
    children: [
      {
        _key: "4c325b02e931",
        _type: "span",
        marks: [],
        text: "Tech Talks har den hensikt å være et årlig arrangement for inspirasjon og faglig påfyll fra næringslivet. Arrangementet pleier å finne sted en gang i midten av februar. Dagen er lagt opp med foredrag, workshops og lyntaler av ulike bedrifter og på kveldstid arrangeres det en bankett. Formatet på arrangementet kan variere fra år til år.\n\nVi begynner å kontakte aktuelle bedrifter for Tech Talks på slutten av høstsemesteret.",
      },
    ],
    markDefs: [],
    style: "normal",
  },
  {
    _key: "b6d815957f97",
    _type: "block",
    children: [{ _key: "52534958c9f8", _type: "span", marks: [], text: "Stillingutlysning" }],
    markDefs: [],
    style: "h2",
  },
  {
    _key: "d3a4b0b3bdbb",
    _type: "block",
    children: [
      {
        _key: "f3e4519057ce",
        _type: "span",
        marks: [],
        text: "Vi har en karriereside [0] på våre nettsider der vi legger ut stillingsannonser for bedrifter som ønsker det. Send en mail til bedriftskontakt@online.ntnu.no eller fyll ut interesseskjema om en annonse skulle være av interesse.",
      },
    ],
    markDefs: [],
    style: "normal",
  },
  {
    _key: "b09a8abfcd1c",
    _type: "block",
    children: [{ _key: "4bdadf4fb1c4", _type: "span", marks: [], text: "Annonse i Offline" }],
    markDefs: [],
    style: "h2",
  },
  {
    _key: "4a0c804b10e5",
    _type: "block",
    children: [
      {
        _key: "79e1f9eac459",
        _type: "span",
        marks: [],
        text: "Offline er linjeforeningsmagasinet til Online. Offline blir lest av våre studenter og i tillegg sendt ut til bedrifter. Som bedrift får dere tilbud om spalte, helsides eller halvsides annonse. Annonsen kan inneholde det dere selv ønsker alt etter hvordan dere ønsker å profilere dere.",
      },
    ],
    markDefs: [],
    style: "normal",
  },
  {
    _key: "4e6ff0fc18f0",
    _type: "block",
    children: [{ _key: "e1c1ed616978", _type: "span", marks: [], text: "ITEX" }],
    markDefs: [],
    style: "h2",
  },
  {
    _key: "8d4a6263467f",
    _type: "block",
    children: [
      {
        _key: "06b51f12e2bc",
        _type: "span",
        marks: [],
        text: "I månedsskifte august/september arrangeres den årlige IT-ekskursjonen til Oslo for masterstudenter på informatikk. Formålet er å reise på besøk til spennende og aktuelle IT-bedrifter for å få bedre kjennskap og forhold til potensielle arbeidsgivere.\n\nVi begynner å kontakte aktuelle bedrifter for ITEX på vårsemesteret.",
      },
    ],
    markDefs: [],
    style: "normal",
  },
];

export const Info = () => {
  return <CompanyInfo props={content} />;
};
