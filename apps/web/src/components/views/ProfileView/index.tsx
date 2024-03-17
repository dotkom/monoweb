import { NextPage } from "next";
import { User } from "next-auth";

const ProfilePoster: NextPage<{ user: User }> = ({ user }) => {
  return (
    <div className="w-full p-3 mt-3 flex justify-center border-2 rounded-lg">
      ProfilePoster
    </div>
  );
};

export default ProfilePoster;
