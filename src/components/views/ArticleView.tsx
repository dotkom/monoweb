import { Box } from "theme-ui";
import { ArticleInfo } from "../organisms/articles/ArticleInfo";
import { ArticleTags } from "../organisms/articles/ArticleTags";
import { ArticleSummary } from "../organisms/articles/ArticleSummary";
import { FC } from "react";

interface ArticleViewProps {
  content: any;
}

export const ArticleView: FC<ArticleViewProps> = (content) => {
  return (
    <Box
      sx={{
        bg: "white",
        display: "flex",
        flexDirection: "column",

        width: "100%",
        margin: "auto",
        // set this to `minHeight: '100vh'` for full viewport height
      }}
    >
      <ArticleInfo content={content} />
      <ArticleTags content={content} />
      <ArticleSummary content={content} />
      {/* <CompanyHeader content={props.content[0]} />
      <CompanyInterestForm content={props.content[1]} />
      <CompanyProducts content={props.content[2]} />
      <CompanyMap />
      <CompanyInfo content={props.content[3]} />
      <CompanyMore content={props.content[4]} /> */}
    </Box>
  );
};
