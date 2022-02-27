import Box from "@components/particles/Box";
import { ArticleInfo } from "../organisms/articles/ArticleInfo";
import { ArticleTags } from "../organisms/articles/ArticleTags";
import { ArticleSummary } from "../organisms/articles/ArticleSummary";
import { FC } from "react";
import { Article } from "src/api/get-article";
import { CSS, css } from "@theme";
import Text from "@components/atoms/Text";

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

        width: "100%",
        margin: "auto",
        // set this to `minHeight: '100vh'` for full viewport height
      }}
    >
      <Box css={styles.articleInfo}>
        <h1 className={styles.title()}>{title}</h1>
        <Box css={{ display: "flex", flexDirection: "row" }}>
          <Box>
            <Text>
              Skrevet av <span>{author}</span>
            </Text>
            <Text>
              Foto av <span>{author}</span>
            </Text>
          </Box>
          <Box>
            <Text>
              Publisert <span>{}</span>
            </Text>
            <Text>
              6 minutter <span>for å lese</span>
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const styles = {
  articleInfo: {
    margin: "auto",
  } as CSS,
  title: css({
    fontFamily: "$body",
    fontSize: "$4xl",
    marginBottom: "$4",
  }),
};
