import { authOptions } from "@dotkomonline/auth/src/web.app";
import { getServerSession } from "next-auth";
import { env } from "@dotkomonline/env";
import { NextRequest, NextResponse } from "next/server";
import { Issuer } from "openid-client";
import jwt from "jsonwebtoken";
import { z } from "zod";

const GroupSchema = z.object({
  id: z.string(),
  type: z.string(),
  displayName: z.string(),
})

const ProfileSchema = z.object({
  norEduPersonLegalName: z.string(),
  uid: z.array(z.string()),
  sn: z.array(z.string()).length(1),
  givenName: z.array(z.string()).length(1),
})

async function getFeideInformation(access_token: string) {
  const groups_response = await fetch("https://groups-api.dataporten.no/groups/me/groups?show_all=true", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (!groups_response.ok) {
    throw new Error("Failed to get groups: " + await groups_response.text());
  }

  const groups = z.array(GroupSchema).parse(await groups_response.json());

  const subjects = groups
    .filter((group) => group.type === "fc:fs:emne")
    .map((group) => ({code: group.id.split(":").slice(5)[0], name: group.displayName}));

  const studyPrograms = groups
    .filter((group) => group.type === "fc:fs:prg")
    .map((group) => ({code: group.id.split(":").slice(5)[0], name: group.displayName}));

  return {subjects, studyPrograms};
}

const JWTSchema = z.object({
  name: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  ntnu_username: z.string(),
  subjects: z.array(z.object({code: z.string(), name: z.string()})),
  studyPrograms: z.array(z.object({code: z.string(), name: z.string()})),
})

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (session === null) {
    return Response.redirect("/", 302);
  }

  const code = new URL(request.url).searchParams.get("code");

  if (code === null) {
    return new Response("Missing code", { status: 400 });
  }

  const issuer = await Issuer.discover("https://auth.dataporten.no")
  const client = new issuer.Client({
    client_id: env.DATAPORTEN_CLIENT_ID,
    client_secret: env.DATAPORTEN_CLIENT_SECRET,
    redirect_uris: [env.DATAPORTEN_REDIRECT_URI],
  });

  const tokenSet = await client.grant({
    code,
    redirect_uri: env.DATAPORTEN_REDIRECT_URI,
    grant_type: "authorization_code",
  });

  if (!tokenSet || !tokenSet.access_token) {
    return new Response("Failed to get token", { status: 500 });
  }

  const feideInformation = await getFeideInformation(tokenSet.access_token);

  const profile_response = await fetch("https://api.dataporten.no/userinfo/v1/userinfo", {
    headers: {
      Authorization: `Bearer ${tokenSet.access_token}`,
    },
  });

  if (!profile_response.ok) {
    return new Response("Failed to get profile: " + await profile_response.text(), { status: 500 });
  }

  const profile = ProfileSchema.parse(await profile_response.json());

  const token = jwt.sign(
    {
      name: profile.norEduPersonLegalName,
      firstName: profile.givenName[0],
      lastName: profile.sn[0],
      ntnu_username: profile.uid[0],
      subjects: feideInformation.subjects,
      studyPrograms: feideInformation.studyPrograms,
    },
    env.NEXTAUTH_SECRET,
    { expiresIn: "1d" }
  );

  const response = NextResponse.redirect(
    new URL("/settings", request.url).toString(), 302
  );

  response.cookies.set("FeideProfileJWT", token, {
    maxAge: Date.now() + 1000 * 60 * 60 * 24,
  });

  response.headers.set("Set-Cookie", "test=1");

  response.cookies.set("test", "1");

  return response;
}
