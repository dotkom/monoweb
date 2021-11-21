/*eslint-disable*/
import BlockContent, { BlockContentProps } from "@sanity/block-content-to-react";
import { Heading } from "@theme-ui/components";
import { FC } from "react";
import { Paragraph } from "theme-ui";

interface PortableTextProps {
  blocks: BlockContentProps["blocks"];
}

const PortableText: FC<PortableTextProps> = ({ blocks }) => {
  const serializers: BlockContentProps["serializers"] = {
    types: {
      block: (props) => {
        const { style = "normal" } = props.node;
        if (/^h\d/.test(style)) {
          return <Heading as={style}>{props.children}</Heading>;
        }
        return <Paragraph>{props.children}</Paragraph>;
      },
    },
  };
  return <BlockContent serializers={serializers} blocks={blocks} />;
};

export default PortableText;
