import { redirect } from "next/navigation";
import { env } from "@dotkomonline/env";

export async function GET(request: Request) {
  const params = new URLSearchParams();

  params.append("client_id", env.DATAPORTEN_CLIENT_ID);
  params.append("response_type", "code");
  params.append("scope", "openid userid-feide userid-name profile groups email");
  params.append("redirect_uri", env.DATAPORTEN_REDIRECT_URI);

  redirect("https://auth.dataporten.no/oauth/authorization?" + params.toString());
}
