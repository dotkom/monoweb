import InterestGroupCard from "../InterestGroupCard";

export default {
  title: "molecules/InterestGroupCard",
  component: InterestGroupCard,
};

const DESC =
  " Interessegruppen for folk som er glad i jul er interessegruppen for, you guessed it, de som er glad i jul.  Gruppens største formål er å spre julens glade budskap, samt spre juleglede når det måtte passe seg.  ";

export const RectangleCard = () => (
  <InterestGroupCard
    backgroundImage="/banner.jpeg"
    description={DESC}
    heading="Folk som er glad i Jul"
    icon="/icon.png"
  />
);

// export const SquareCard = () => (
//   <InterestGroupCard css={{ maxWidth: "250px" }}>
//     <Content />
//   </InterestGroupCard>
// );
