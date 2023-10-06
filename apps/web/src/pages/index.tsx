import { useSession } from "next-auth/react";
import React from "react";

const Home: React.FC = () => {
  const auth = useSession();

  return (
    <div>
      <p>Homepage</p>
      <pre>{JSON.stringify(auth, null, 2)}</pre>
    </div>
  );
};

export default Home;
