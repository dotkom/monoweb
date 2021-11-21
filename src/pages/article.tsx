import { ArticleView } from "@components/views/ArticleView";
import { GetServerSideProps } from "next";
import React, { FC } from "react";
import { fetchCompanySectionData } from "src/api/get-company-page";

interface ArticleProps {
  sections: [Record<string, unknown>];
}

// export const getServerSideProps: GetServerSideProps = async () => {
//   const data = await fetchCompanySectionData();
//   return { props: { sections: data } };
// };
const Article: FC<ArticleProps> = (props: ArticleProps) => {
  return <ArticleView content={props.sections} />;
};

export default Article;
