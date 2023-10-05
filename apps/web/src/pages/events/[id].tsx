import { trpc } from "@/utils/trpc";
import { appRouter, createContextInner, transformer } from "@dotkomonline/gateway-trpc";
import { Button } from "@dotkomonline/ui";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { type GetStaticPaths, type GetStaticPropsContext, type InferGetStaticPropsType } from "next";
import { type FC } from "react";

const EventDetailPage: FC<InferGetStaticPropsType<typeof getStaticProps>> = (props) => {
    const { id } = props;
    const { data } = trpc.event.get.useQuery(id);
    const { data: attendance } = trpc.event.attendance.get.useQuery({ eventId: id });
    const { mutate: addAttendance } = trpc.event.attendance.create.useMutation();
    const { mutate: attendEvent } = trpc.event.attendance.attend.useMutation();
    const utils = trpc.useContext();

    return (
        <div>
            <h1>Event</h1>
            <pre>{JSON.stringify(data, null, 2)}</pre>
            <Button
                onClick={async () => {
                    await addAttendance({
                        deregisterDeadline: new Date(),
                        end: new Date(),
                        eventId: id,
                        limit: 20,
                        max: 5,
                        min: 1,
                        start: new Date(),
                    });

                    utils.event.attendance.get.invalidate();
                }}
            >
                Add attendance group
            </Button>
            <Button
                onClick={async () => {
                    await attendEvent({
                        eventId: id,
                    });

                    utils.event.attendance.get.invalidate();
                }}
            >
                Join random group
            </Button>
            <h2>Attendance</h2>
            <pre>{JSON.stringify(attendance, null, 2)}</pre>
        </div>
    );
};

export const getStaticPaths: GetStaticPaths = async () => {
    const helpers = createServerSideHelpers({
        ctx: await createContextInner({
            auth: null,
        }),
        router: appRouter,
        transformer, // optional - adds superjson serialization
    });

    const events = await helpers.event.all.fetch();

    return {
        fallback: "blocking",
        paths: events.map(({ id }) => ({ params: { id } })),
    };
};

export const getStaticProps = async (ctx: GetStaticPropsContext<{ id: string }>) => {
    const helpers = createServerSideHelpers({
        ctx: await createContextInner({
            auth: null,
        }),
        router: appRouter,
        transformer, // optional - adds superjson serialization
    });

    const id = ctx.params?.id;

    if (!id) {
        return { notFound: true };
    }

    await helpers.event.get.prefetch(id);

    return {
        props: {
            id,
            trpcState: helpers.dehydrate(),
        },
        revalidate: 86400,
    };
};

export default EventDetailPage;
