import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import ProfilePoster from "@/components/views/ProfileView";

const ProfilePage = async () => {
  const session = await getServerSession();

  if (session === null) {
    redirect("/");
  }

  return <ProfilePoster user={session.user} />;
};

export default ProfilePage;
