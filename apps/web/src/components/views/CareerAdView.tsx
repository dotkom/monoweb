import { type CareerAd } from "@/api/get-career-ads";
import PortableText from "@/components/molecules/PortableText";
import { Button } from "@dotkomonline/ui";
import { Icon } from "@dotkomonline/ui";
import Image from "next/image";
import Link from "next/link";
import { type FC } from "react";

interface CareerAdViewProps {
    career: CareerAd;
}

export const CareerAdView: FC<CareerAdViewProps> = (props: CareerAdViewProps) => {
    const {
        career_role,
        company_info,
        company_name,
        content,
        deadline,
        facebook,
        image,
        link,
        linkdin,
        location,
        title,
        twitter,
    } = props.career;

    return (
        <div className="mx-auto mt-10 flex w-10/12 justify-between">
            <div className="w-1/3">
                <div className="relative pb-10">
                    <Image alt="company_image" height={250} src={image.asset.url} width={4000} />
                </div>

                <p>{company_info}</p>

                <div className="bg-slate-12 mx-auto mb-14 mt-10 h-[0.5px] w-full" />
                <Link href="/career">
                    <div className="flex items-center">
                        <Icon className="text-blue-9" height={20} icon="mdi:arrow-left" width={20} />
                        <h2 className="m-0 border-0 pl-2 text-base text-blue-500"> ANDRE MULIGHETER</h2>
                    </div>
                </Link>
                <div className="bg-slate-9 mb-7 mt-3 h-[0.5px] w-full" />
                <div className="my-3 flex items-center">
                    <Icon className="text-blue-9" height={20} icon="mdi:globe" width={20} />
                    <p className="m-0 pl-2">{location}</p>
                </div>
                <div className="bg-slate-9 my-7 h-[0.5px] w-full" />
                <div className="my-3 flex items-center">
                    <div className="text-blue-9 mb-[-3px] inline">
                        <Icon className="text-blue-9" height={20} icon="mdi:clock-outline" width={20} />
                    </div>
                    <p className="m-0 pl-2">{deadline}</p>
                </div>
                <div className="bg-slate-9 my-7 h-[0.5px] w-full" />
                <div className="my-3 flex items-center">
                    <div className="text-blue-9 mb-[-3px] inline">
                        <Icon className="text-blue-9" height={20} icon="mdi:briefcase-outline" width={20} />
                    </div>
                    <p className="m-0 pl-2">{career_role}</p>
                </div>
                <div className="bg-slate-9 my-7 h-[0.5px] w-full" />
                <div className="my-3 flex items-center">
                    <div className="text-blue-9 mb-[-3px] inline">
                        <Icon className="text-blue-9" height={20} icon="mdi:content-copy" width={20} />
                    </div>
                    <p className="m-0 pl-2">{career_role}</p>
                </div>
                <div className="bg-slate-9 mb-3 mt-7 h-[0.5px] w-full" />
                <div className="text-blue-9">
                    {linkdin && (
                        <Link href={linkdin}>
                            <Icon className="m-1 inline-block" height={40} icon="devicon:linkedin" width={40} />
                        </Link>
                    )}
                    {twitter && (
                        <Link href={twitter}>
                            <Icon className="m-1 inline-block" height={40} icon="devicon:twitter" width={40} />
                        </Link>
                    )}
                    {facebook && (
                        <Link href={facebook}>
                            <Icon className="m-1 inline-block" height={40} icon="devicon:facebook" width={40} />
                        </Link>
                    )}
                </div>
                <Link href={link}>
                    <Button className="bg-blue-8 mt-3 w-20">Søk</Button>
                </Link>
            </div>
            <div className="w-2/3">
                <div className="border-amber-9 ml-8 mt-2 border-l-[1px] pl-4">
                    <p className="m-0 text-4xl font-bold">{company_name}</p>
                    <p className="m-0 text-3xl">{title}</p>
                </div>
                <div className="[&>*]:border-amber-9 mb-12 ml-8 flex flex-col gap-6 [&>*]:border-l-[1px] [&>*]:pl-4 [&>h2]:m-0 [&>h2]:border-b-0">
                    <PortableText blocks={content} />
                </div>
            </div>
        </div>
    );
};
