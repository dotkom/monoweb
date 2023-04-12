import { FC } from "react"
import { IndividualCompanyView } from "@/components/views/IndividualCompanyView"
import { GetServerSideProps, GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType } from "next";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { appRouter, createContextInner, transformer } from "@dotkomonline/api";
import { Company } from "@dotkomonline/types";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import { NextPageWithLayout } from "../_app";
import MainLayout from "@/components/layout/MainLayout";

const testData = {
    "id":"7c45f557-0ae2-4153-9934-375dc8c94f7b",
    "createdAt":"2023-02-28T17:23:45.329Z",
    "name":"Bekk",
    "description":"Lorem ipsum dolor sit amet consectetur, adipisicing elit. Officiis aperiam distinctio corrupti, quod, nemo adipisci quae labore dicta in reiciendis animi, dolore excepturi nam suscipit necessitatibus reprehenderit aut error neque.",
    "phone":"+47 123 45 678",
    "email":"bekk@bekk.no",
    "website":"https://bekk.no",
    "location":"Oslo & Trondheim",
    "type":"Consulting",
    // "image":null,
    "image":"https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/lg/6a826628-9ebf-426e-9966-625513779427.png",
}

interface CompanyProps {
    company: Company,
}

// export const getServerSideProps: GetServerSideProps<CompanyProps> = async (ctx) => {
//     const id = ctx.query.id as string
//     return { props: { company: data } }
// }

const CompanyPage: NextPageWithLayout = () => {
    const router = useRouter()
    const { id } = router.query as { id: string }

    // const { data, isLoading } = trpc.company.get.useQuery(id)
    // if (isLoading) return <div>Loading...</div>
    // return <pre>{JSON.stringify(data)}</pre>
    // return <div>{id}</div>
    return <IndividualCompanyView company={testData} />
}

// CompanyPage.getLayout = (page) => {
//     return (
//         <MainLayout>
//             {page}
//         </MainLayout>
//     )
// }

// const CompanyPage: FC<InferGetStaticPropsType<typeof getStaticProps>> = (props) => {
//     return <IndividualCompanyView company={props.company} />
// }



// export const getStaticPaths: GetStaticPaths = async () => {
//     const ssg = createProxySSGHelpers({
//       router: appRouter,
//       ctx: await createContextInner({
//         auth: null,
//       }),
//       transformer: transformer,
//     })
//     const companies = await ssg.company.all.fetch()
//     return {
//       paths: companies.map(({ id }) => ({ params: { id } })),
//       fallback: "blocking",
//     }
//   }
  
//   export const getStaticProps = async (ctx: GetStaticPropsContext<{ id: string }>) => {
//     const ssg = createProxySSGHelpers({
//       router: appRouter,
//       ctx: await createContextInner({
//         auth: null,
//       }),
//       transformer: transformer,
//     })
//     const id = ctx.params?.id
//     if (!id) {
//       return { notFound: true }
//     }
//     const company = await ssg.company.get.fetch(id)
  
//     return {
//       props: {
//         company,
//       },
//       revalidate: 86400,
//     }
//   }

export default CompanyPage