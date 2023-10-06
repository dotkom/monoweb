import { type PortableTextProps } from "@/components/molecules/PortableText";

import client from "./sanity";

export interface CareerAd {
  career_role: string;
  career_type: string;
  company_info: string;
  company_name: string;
  content: PortableTextProps["blocks"];
  deadline: string;
  facebook: string;
  image: { asset: { url: string } };
  instagram: string;
  link: string;
  linkdin: string;
  location: string;
  slug: { current: string };
  title: string;
  twitter: string;
}

const adQuery = `*[_type == "career" && slug.current==$slug && !(_id in path("drafts.**"))][0]{
  title,
  company_name,
  image { asset->{url} },
  career_type,
  location,
  deadline,
  company_info,
  content,
  link,
  career_role,
  facebook,
  twitter,
  linkdin,
  slug
}`;

const adsQuery = `*[_type == "career" && !(_id in path("drafts.**"))]{
  title,
  company_name,
  image { asset->{url} },
  career_type,
  location,
  deadline,
  company_info,
  content,
  link,
  career_role,
  facebook,
  twitter,
  linkdin,
  slug
}`;

export const fetchCareerAd = async (slug: string): Promise<CareerAd> => {
  const res = await client.fetch(adQuery, { slug });

  return res;
};

export const fetchCareerAds = async (): Promise<Array<CareerAd>> => {
  const res = await client.fetch(adsQuery);

  return res;
};
