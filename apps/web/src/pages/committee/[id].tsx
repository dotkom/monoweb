import { CommitteeView } from "@/components/views/CommitteeView";
import { trpc } from "@/utils/trpc";
import { appRouter, createContextInner, transformer } from "@dotkomonline/gateway-trpc";
import { type Committee } from "@dotkomonline/types";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { type GetStaticPaths, type GetStaticPropsContext, type InferGetStaticPropsType } from "next";
import { useRouter } from "next/router";
import { type FC } from "react";

const CommitteePage: FC<InferGetStaticPropsType<typeof getStaticProps>> = (props) => {
    const router = useRouter();
    const { id } = router.query as { id: string };

    const { data: eventsData, isLoading: isLoadingEvents } = trpc.event.allByCommittee.useQuery({ id });

    return <CommitteeView committee={props.committee} events={eventsData} isLoadingEvents={isLoadingEvents} />;
};

export const getStaticPaths: GetStaticPaths = async () => {
    const ssg = createServerSideHelpers({
        ctx: await createContextInner({
            auth: null,
        }),
        router: appRouter,
        transformer,
    });

    const companies = await ssg.committee.all.fetch();

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

    let committee: Committee;

    try {
        committee = await ssg.committee.get.fetch(id);
    } catch (e) {
        return { notFound: true };
    }

    return {
        props: {
            committee,
        },
        revalidate: 86400,
    };
};

export default CommitteePage;
