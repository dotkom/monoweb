/*eslint-disable*/
import BlockContent, { BlockContentProps } from "@sanity/block-content-to-react";
import { FC } from "react";
import Text from "@components/atoms/Text";

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
          return <Text as={style}>{props.children}</Text>;
        }
        return <Text>{props.children}</Text>;
      },
    },
  };
  return <BlockContent className={className} serializers={serializers} blocks={blocks} />;
};

export default PortableText;
