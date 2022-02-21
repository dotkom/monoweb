import EventCard from "../EventCard";

export default {
  title: "molecules/EventCard",
  component: EventCard,
};

export const Primary = () => (
  <EventCard
    title="Bedriftspresentasjon med Bekk"
    eventStart={new Date(2022, 8, 2)}
    capacity={30}
    attendees={10}
    tags={["Bedpres"]}
    location="R69"
    thumbnailUrl="https://images.unsplash.com/photo-1505236858219-8359eb29e329?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1262&q=80"
  />
);
