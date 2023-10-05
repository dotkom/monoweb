import { EntryDetailLayout } from "@/components/layout/EntryDetailLayout";
import { EventList } from "@/components/organisms/EventList";
import { type Committee, type Event } from "@dotkomonline/types";
import { Icon } from "@dotkomonline/ui";
import Image from "next/image";
import { type FC } from "react";

interface CommitteeViewProps {
    committee: Committee;
    events?: Array<Event>;
    isLoadingEvents: boolean;
}

export const CommitteeView: FC<CommitteeViewProps> = (props: CommitteeViewProps) => {
    const { description, email, image, name } = props.committee;

    const icons = [{ href: `mailto:${email}`, icon: "material-symbols:mail", text: email }];

    return (
        <EntryDetailLayout color={"BLUE"} title={name}>
            <div className="grid gap-x-12 gap-y-6 sm:grid-cols-[18rem_minmax(100px,_1fr)] md:grid-cols-[24rem_minmax(100px,_1fr)]">
                <div className="border-blue-7 flex h-fit flex-col gap-y-3 rounded-lg border-none sm:gap-y-2">
                    {image && (
                        <div className="relative mb-4 h-64 w-full overflow-hidden rounded-lg bg-[#fff]">
                            <Image
                                alt="Committee logo"
                                className="w-full"
                                fill
                                src={image}
                                style={{ objectFit: "contain" }}
                            />
                        </div>
                    )}

                    <div className="text-blue-12 flex flex-col gap-y-2 px-1 text-lg">
                        {icons.map(({ href, icon, text }, index) => (
                            <div className="flex items-center gap-x-2" key={index}>
                                <Icon icon={icon} width="28"></Icon>
                                {href === null ? (
                                    <span>{text}</span>
                                ) : (
                                    <a
                                        className="text-blue-11 hover:text-blue-10"
                                        href={href}
                                        rel="noreferrer"
                                        target="_blank"
                                    >
                                        {text ? text : "N/A"}
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <p>{description}</p>
            </div>
            {/* TODO: Redesign later */}
            <div className="mt-6 flex flex-col gap-x-16 gap-y-12 lg:flex-row">
                <EventList events={props.events} isLoading={props.isLoadingEvents} title={"Kommende arrangementer"} />
                <EventList
                    events={props.events}
                    isLoading={props.isLoadingEvents}
                    title={"Tidligere arrangementer"}
                />{" "}
                {/* TODO: Separate logic for earlier eventlist later */}
            </div>
        </EntryDetailLayout>
    );
};
