import { Icon } from "@iconify/react";
import { notifications } from "@mantine/notifications";
import { useState } from "react";

export interface NotificationProps {
  message: string;
  title: string;
}

export const useQueryNotification = () => {
  const [id] = useState(() => crypto.randomUUID());
  const loading = ({ message, title }: NotificationProps) =>
    notifications.show({
      color: "blue",
      icon: <Icon icon="tabler:loader-2" />,
      id,
      loading: true,
      message,
      title,
    });

  const complete = ({ message, title }: NotificationProps) =>
    notifications.update({
      color: "green",
      icon: <Icon icon="tabler:check" />,
      id,
      loading: false,
      message,
      title,
    });

  const fail = ({ message, title }: NotificationProps) =>
    notifications.update({
      color: "red",
      icon: <Icon icon="tabler:mood-sad-dizzy" />,
      id,
      message,
      title,
    });

  return {
    complete,
    fail,
    loading,
  };
};
