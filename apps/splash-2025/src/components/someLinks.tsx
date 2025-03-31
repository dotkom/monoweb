import { FacebookIcon, InstagramIcon, SlackIcon } from "./icons";

export const SoMeLinks = () => {
	const links = [
		{
			icon: <FacebookIcon />,
			url: "https://www.facebook.com/groups/1547182375336132",
			key: "facebook",
		},
		{
			icon: <InstagramIcon />,
			url: "https://www.instagram.com/online_ntnu/",
			key: "instagram",
		},
		{ icon: <SlackIcon />, url: "https://onlinentnu.slack.com/", key: "slack" },
	];

	return (
		<ul className="mx-8 gap-4 flex sm:justify-center">
			{links.map((link) => (
				<a href={link.url} key={link.key}>
					<li className="w-16 cursor-pointer">{link.icon}</li>
				</a>
			))}
		</ul>
	);
};
