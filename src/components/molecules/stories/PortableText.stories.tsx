import PortableText from "../PortableText";

export default {
  title: "molecules/PortableText",
  component: PortableText,
};

const LOREM_BLOCKS = [
  {
    _key: "89a6d852c109",
    _type: "block",
    children: [{ _key: "c678801e5f16", _type: "span", marks: [], text: "Lorem 1: The followship of Ipsums" }],
    markDefs: [],
    style: "h1",
  },
  {
    _key: "6c26df1417a1",
    _type: "block",
    children: [
      {
        _key: "c98dad2e5216",
        _type: "span",
        marks: [],
        text: "This Lorem block is pretty cool",
      },
    ],
    markDefs: [],
    style: "normal",
  },
  {
    _key: "a64445fe257b",
    _type: "block",
    children: [{ _key: "8118f8e1c326", _type: "span", marks: [], text: "Lorem 2: Two Ipsums" }],
    markDefs: [],
    style: "h2",
  },
  {
    _key: "5179b6e11de2",
    _type: "block",
    children: [
      {
        _key: "99257fc1809f",
        _type: "span",
        marks: [],
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras faucibus sagittis libero vitae ullamcorper. Fusce rutrum consectetur purus non consequat. Etiam non erat orci. Aenean massa arcu, congue vel eros vitae, placerat pharetra neque. Sed vitae viverra urna. Etiam ac ullamcorper mi, in dictum ante. Pellentesque ac eleifend dolor.",
      },
    ],
    markDefs: [],
    style: "normal",
  },
  {
    _key: "a64445fe257b",
    _type: "block",
    children: [{ _key: "8118f8e1c326", _type: "span", marks: [], text: "Lorem 3: Return of the Ipsum" }],
    markDefs: [],
    style: "h3",
  },
  {
    _key: "3a385c4bcccb",
    _type: "block",
    children: [
      {
        _key: "19a27e963465",
        _type: "span",
        marks: [],
        text: "Praesent quis vehicula mi. Curabitur feugiat mi quam, a cursus mauris semper eget. Proin tempor lacinia consequat. Pellentesque consectetur, magna a rhoncus tristique, dolor nisi efficitur enim, in interdum augue eros a justo. Pellentesque vulputate nisl a tellus posuere hendrerit. Proin et enim magna. Ut fringilla ipsum sed purus vestibulum molestie. Duis pulvinar mauris quis lorem rhoncus, in accumsan justo vehicula.",
      },
    ],
    markDefs: [],
    style: "normal",
  },
  {
    _key: "dfaaf8884712",
    _type: "block",
    children: [
      {
        _key: "b6bee9db4601",
        _type: "span",
        marks: [],
        text: "Quisque faucibus tincidunt scelerisque. Duis lacinia aliquam purus, eu blandit est vehicula in. Nulla facilisi. Aliquam in viverra augue, et dignissim lacus. Duis rhoncus ornare justo, eget porta nisi efficitur in. Aenean aliquet vehicula ex, at cursus mi vestibulum eu. Cras sed efficitur elit, vel rutrum diam.",
      },
    ],
    markDefs: [],
    style: "normal",
  },
  {
    _key: "4b2d0155a70d",
    _type: "block",
    children: [{ _key: "2a119b43bdab", _type: "span", marks: [], text: "" }],
    markDefs: [],
    style: "normal",
  },
  {
    _key: "4af56b348490",
    _type: "block",
    children: [
      {
        _key: "fedbf5294791",
        _type: "span",
        marks: [],
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam sed bibendum dui, quis mollis turpis. Cras quis enim nec risus scelerisque consequat. Cras at leo augue. Proin bibendum massa vitae gravida congue. Vestibulum dictum pellentesque sem. Nulla facilisi. Nunc aliquet metus sit amet fringilla commodo. Vivamus iaculis sagittis sem, a venenatis lectus gravida vitae. Quisque vehicula tempor nisl, quis faucibus sapien tincidunt quis.",
      },
    ],
    markDefs: [],
    style: "normal",
  },
  {
    _key: "13fd0d38a1e8",
    _type: "block",
    children: [
      {
        _key: "3ca6c46d743d",
        _type: "span",
        marks: [],
        text: "Aliquam orci sem, eleifend vitae nibh sit amet, dapibus scelerisque mauris. Vestibulum ut tortor sapien. Proin egestas dolor vel blandit rutrum. Fusce rhoncus, risus eu consequat feugiat, dui ante viverra nulla, id hendrerit mauris elit eget leo. Maecenas molestie erat metus, ac rhoncus ex tincidunt non. Nam neque urna, faucibus sed malesuada ac, ultricies ac nisi. Phasellus cursus diam ut neque tristique porttitor. Ut non imperdiet tellus. Sed porta metus in libero vestibulum malesuada. Phasellus vehicula sem ut orci accumsan imperdiet.",
      },
    ],
    markDefs: [],
    style: "normal",
  },
];

export const Lorem = () => <PortableText blocks={LOREM_BLOCKS} />;
