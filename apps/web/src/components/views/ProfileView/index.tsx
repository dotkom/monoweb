import type { NextPage } from "next"
import type { User } from "next-auth"
import {Button} from "../../../../../../packages/ui";
import { Issuer } from "openid-client";
import {oidcConfig} from "@/app/dataporten/study/callback/route";
import {getAuthorizationUrl} from "@/utils/dataporten";
import client from "@/api/sanity";
import {cookies} from "next/headers";

const ProfilePoster: NextPage<{ user: User }> = async ({ user }) => {
  const authorizationUrl = await getAuthorizationUrl();

  const groups = cookies().getAll().map(cookie => cookie.name);
  return <div className="w-full p-3 mt-3 flex justify-center border-2 rounded-lg">
    <p>
      <a href={authorizationUrl}>Logg inn med FEIDE</a>
    </p>
    <br/>

    <pre>
      {JSON.stringify(groups, null, 2)}
    </pre>
  </div>
}

export default ProfilePoster
