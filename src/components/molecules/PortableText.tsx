/*eslint-disable*/
import BlockContent, { BlockContentProps } from "@sanity/block-content-to-react";
import { Heading } from "@theme-ui/components";
import { FC } from "react";
import { Paragraph } from "theme-ui";

interface PortableTextProps {
  blocks: BlockContentProps["blocks"];
  className?: string;
}

const PortableText: FC<PortableTextProps> = ({ blocks, className }) => {
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
  return <BlockContent className={className} serializers={serializers} blocks={blocks} />;
};

export default PortableText;
