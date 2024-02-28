import { id } from "date-fns/locale";
import { trpc } from "../../../utils/trpc";

export const useInterestGroupAllQuery = () => {
  return [
    {
      id: 1,
      name: "name",
      description: "description",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      createdBy: "createdBy",
      updatedBy: "updatedBy",
      interestGroup: "interestGroup",
      slackLink: "slackLink",
      imageLink: "imageLink",
    },
  ];
};
