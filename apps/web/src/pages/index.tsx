import React from "react";
import { useSession } from "next-auth/react";
import { trpc } from "@/utils/trpc";

export const useSessionWithDBUser = (): {
  isLoading: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    image: string;
    studyYear: number;
  };
} => {
  const { data: session, status } = useSession();
  const { data, isLoading: dbCallLoading } = trpc.user.get.useQuery(
    session?.user.id ?? "",
    {
      enabled: Boolean(session?.user.id),
    }
  );

  // Initialize user with default values
  const defaultUser = {
    id: "",
    email: "",
    name: "",
    image: "",
    studyYear: 0,
  };

  return {
    isLoading: dbCallLoading || status === "loading",
    user: {
      id: session?.user.id ?? defaultUser.id,
      email: session?.user.email ?? defaultUser.email,
      name: session?.user.name ?? defaultUser.name,
      image: session?.user.image ?? defaultUser.image,
      studyYear: data?.studyYear ?? defaultUser.studyYear,
    },
  };
};

const Home: React.FC = () => {
  const auth = useSessionWithDBUser();
  return (
    <div>
      <p>Homepage</p>
      <pre>{JSON.stringify(auth, null, 2)}</pre>
    </div>
  );
};

export default Home;
