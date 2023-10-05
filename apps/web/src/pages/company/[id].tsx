import { CompanyView } from "@/components/views/CompanyView";
import { trpc } from "@/utils/trpc";
import { appRouter, createContextInner, transformer } from "@dotkomonline/gateway-trpc";
import { type Company } from "@dotkomonline/types";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { type GetStaticPaths, type GetStaticPropsContext, type InferGetStaticPropsType } from "next";
import { useRouter } from "next/router";
import { type FC } from "react";

const CompanyPage: FC<InferGetStaticPropsType<typeof getStaticProps>> = (props) => {
    const router = useRouter();
    const { id } = router.query as { id: string };

    const { data: eventsData, isLoading: isLoadingEvents } = trpc.event.allByCompany.useQuery({ id });

    return <CompanyView company={props.company} events={eventsData} isLoadingEvents={isLoadingEvents} />;
};

export const getStaticPaths: GetStaticPaths = async () => {
    const ssg = createServerSideHelpers({
        ctx: await createContextInner({
            auth: null,
        }),
        router: appRouter,
        transformer,
    });

    const companies = await ssg.company.all.fetch();

    return {
        fallback: "blocking",
        paths: companies.map(({ id }) => ({ params: { id } })),
    };
};

export const getStaticProps = async (ctx: GetStaticPropsContext<{ id: string }>) => {
    const ssg = createServerSideHelpers({
        ctx: await createContextInner({
            auth: null,
        }),
        router: appRouter,
        transformer,
    });

    const id = ctx.params?.id;

    if (!id) {
        return { notFound: true };
    }

    let company: Company;
    try {
        company = await ssg.company.get.fetch(id);
    } catch (e) {
        return { notFound: true };
    }

    return {
        props: {
            company,
        },
        revalidate: 86400,
    };
};

export default CompanyPage;
