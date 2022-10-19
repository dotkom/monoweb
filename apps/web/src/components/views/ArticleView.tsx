import { Box, Flex } from "../primitives"
import { FC } from "react"
import { Article } from "src/api/get-article"
import { CSS, css, styled } from "@dotkom/ui"
import PortableText from "@components/molecules/PortableText"
import Image from "next/image"
import { DateTime } from "luxon"
import { Badge, Text } from "@dotkom/ui"

interface ArticleViewProps {
  article: Article
}

export const ArticleView: FC<ArticleViewProps> = (props: ArticleViewProps) => {
  const { title, author, photographer, _createdAt, tags, excerpt, cover_image, content, estimatedReadingTime } =
    props.article

  const date = DateTime.fromISO(_createdAt)

  return (
    <Flex
      css={{
        bg: "$white",
        flexDirection: "column",
        justifyContent: "center",
        maxWidth: "$lg",
        margin: "auto",
        fontFamily: "$body",
      }}
    >
      <Flex css={styles.articleInfo}>
        <h1 className={styles.title()}>{title}</h1>
        <Flex css={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Box>
            <Text>
              Skrevet av <span className={styles.lightFont()}>{author}</span>
            </Text>
            <Text>
              Foto av <span className={styles.lightFont()}>{photographer}</span>
            </Text>
          </Box>
          <Box>
            <Text>
              Publisert <span className={styles.lightFont()}>{date.toFormat("dd MMM yyyy", { locale: "no" })}</span>
            </Text>
            <Text>
              {estimatedReadingTime} minutter <span className={styles.lightFont()}>for å lese</span>
            </Text>
          </Box>
        </Flex>
        <Flex css={styles.tagContainer}>
          {tags.map((tag: string, key: number) => (
            <Badge key={key} variant="subtle" color="gray" css={{ marginRight: "$3" }}>
              {tag}
            </Badge>
          ))}
        </Flex>
        <Text css={styles.excerpt}>{excerpt}</Text>
      </Flex>
      {cover_image ? (
        <Box css={{ margin: "auto", maxHeight: "$md", paddingBottom: "$5" }}>
          <Image width={800} height={400} src={cover_image.asset.url} alt="cover image" />
        </Box>
      ) : (
        ""
      )}
      <Content blocks={content} />
    </Flex>
  )
}

const styles = {
  articleInfo: {
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
    paddingBottom: "$1",
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
    flexDirection: "row",
    justifyContent: "flex-start",
    flexWrap: "wrap",
    paddingBottom: "$4",
  } as CSS,
}

const Content = styled(PortableText, styles.content)
