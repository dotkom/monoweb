import Box from "@components/particles/Box";
import { FC } from "react";
import { Article } from "src/api/get-article";
import { CSS, css, styled } from "@theme";
import Text from "@components/atoms/Text";
import PortableText from "@components/molecules/PortableText";
import Image from "next/image";

interface ArticleViewProps {
  article: Article;
}

export const ArticleView: FC<ArticleViewProps> = (props: ArticleViewProps) => {
  console.log(props);
  const { title, author, _createdAt, tags, excerpt, cover_image, content } = props.article;
  return (
    <Box
      css={{
        bg: "$white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        maxWidth: "$lg",
        margin: "auto",
        fontFamily: "$body",
        // set this to `minHeight: '100vh'` for full viewport height
      }}
    >
      <Box css={styles.articleInfo}>
        <h1 className={styles.title()}>{title}</h1>
        <Box css={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
          <Box>
            <Text>
              Skrevet av <span className={styles.lightFont()}>{author}</span>
            </Text>
            <Text>
              Foto av <span className={styles.lightFont()}>{author}</span>
            </Text>
          </Box>
          <Box>
            <Text>
              Publisert <span className={styles.lightFont()}>{}</span>
            </Text>
            <Text>
              6 minutter <span className={styles.lightFont()}>for å lese</span>
            </Text>
          </Box>
        </Box>
        <Box css={styles.tagContainer}>
          {tags.map((tag: String, key: number) => (
            <p key={key}>{tag}</p>
          ))}
        </Box>
        <Text css={styles.excerpt}>{excerpt}</Text>
      </Box>
      <Box css={{ margin: "auto", maxHeight: "$md", paddingBottom: "$5" }}>
        <Image width={800} height={400} src={cover_image.asset.url} />
      </Box>
      <PortableText className={styles.content()} blocks={content} />
    </Box>
  );
};

const styles = {
  articleInfo: {
    display: "flex",
    flexDirection: "column",
    margin: "auto",
    maxWidth: "$md",
    fontSize: "$sm",
    color: "$gray2",
    fontWeight: "bold",
    padding: "$4",
  } as CSS,
  lightFont: css({
    fontWeight: "normal",
  }),
  title: css({
    fontSize: "$5xl",
    marginBottom: "$2",
    color: "$black",
    lineHeight: "1.4",
    textAlign: "center",
  }),
  excerpt: {
    color: "$black",
    fontSize: "$md",
  } as CSS,
  content: css({
    "& > h1, h2, h3": {
      color: "$blue4",
      paddingTop: "$4",
    },
    "& > p": {
      color: "$black",
      fontSize: "$sm",
    },
    maxWidth: "$md",
    margin: "auto",
  }),
  tagContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    flexWrap: "wrap",
    paddingBottom: "$2",
  } as CSS,
};
