"use client";
import { Icon } from "@iconify/react";
import { Skeleton, Stack, Tabs, Title } from "@mantine/core";
import { GenericTable } from "src/components/GenericTable";
import { useInterestGroupAllQuery } from "src/modules/interest-group/queries/use-interest-group-all-query";
import { useCreateInterestGroupMutation } from "src/modules/interest-group/mutations/create-interest-group-mutation";
import { trpc } from "src/utils/trpc";

const InterestGroupPage = () => {
  const { interestGroups, isLoading: isInterestGroupsLoading } =
    useInterestGroupAllQuery();
  const createInterestGroup = useCreateInterestGroupMutation();
  //add seed data
  return (
    <div>
      <pre>{JSON.stringify(interestGroups, null, 2)}</pre>{" "}
      <button
        onClick={() => {
          //use create interest group mutation
          createInterestGroup.mutate({
            name: "Test",
            description: "Test description",
            updatedAt: new Date(),
          });
        }}
      >
        Create Interest Group
      </button>
    </div>
  );
};

export default InterestGroupPage;
