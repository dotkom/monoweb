import InterestGroupCard from "../InterestGroupCard";
import SquareInterestGroupCard from "../SquareInterestGroupCard";

export default {
  title: "molecules/InterestGroupCard",
  component: InterestGroupCard,
};

const DESC =
  " Interessegruppen for folk som er glad i jul er interessegruppen for, you guessed it, de som er glad i jul.  Gruppens største formål er å spre julens glade budskap, samt spre juleglede når det måtte passe seg.  ";

const LONGDESC =
  "Hovedoppgaven til interessegruppen er å få samlet mennesker for å spille squash, dra å kite, låne hall for å spille håndball osv. Dvs. sporter/idretter der man gjerne trenger å være flere for å kunne drive med. Vi skal etterstrebe å ha et arrangement";

export const RectangleCard = () => (
  <InterestGroupCard
    backgroundImage="/banner.jpeg"
    description={DESC}
    heading="Folk som er glad i Jul"
    icon="/icon.png"
  />
);

export const LongDescRectangleCard = () => (
  <InterestGroupCard
    backgroundImage="/banner.jpeg"
    description={LONGDESC}
    heading="Folk som er glad i Jul"
    icon="/icon.png"
  />
);

export const SquareCard = () => (
  <SquareInterestGroupCard
    backgroundImage="/banner.jpeg"
    description={DESC}
    heading="Folk som er glad i Jul"
    icon="/icon.png"
  />
);

export const LongDescSquareCard = () => (
  <SquareInterestGroupCard
    backgroundImage="/banner.jpeg"
    description={LONGDESC}
    heading="Folk som er glad i Jul"
    icon="/icon.png"
  />
);