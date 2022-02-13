import Image from "next/image";
import { styled } from "@theme";
import Box from "@components/particles/Box";

interface IconProps {
  src: string;
}

const IconImage = styled("img", {});

const Icon: React.FC<IconProps> = ({ src }) => {
  return (
    <Box>
      <Image src={src} layout="fill" />

    </Box>
  );
};

export default Icon;
