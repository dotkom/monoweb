"use client";
import { Icon } from "@iconify/react";
import { Button, Skeleton, Stack, Tabs, Title } from "@mantine/core";
import { GenericTable } from "src/components/GenericTable";
import { useInterestGroupAllQuery } from "src/modules/interest-group/queries/use-interest-group-all-query";
import { useCreateInterestGroupMutation } from "src/modules/interest-group/mutations/create-interest-group-mutation";
import { trpc } from "src/utils/trpc";
import { useCreateInterestGroupModal } from "src/modules/interest-group/modals/create-interest-group-modal";

const InterestGroupPage = () => {
  const { interestGroups, isLoading: isInterestGroupsLoading } =
    useInterestGroupAllQuery();
  const open = useCreateInterestGroupModal();
  return (
    <div>
      <pre>{JSON.stringify(interestGroups, null, 2)}</pre>{" "}
      <Button onClick={open}>Create Interest Group</Button>
    </div>
  );
};

export default InterestGroupPage;
