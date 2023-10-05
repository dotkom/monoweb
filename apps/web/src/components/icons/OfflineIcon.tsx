import { type SVGProps } from "react";

const SvgOfflineIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg
        viewBox="0 0 256 256"
        xmlns="http://www.w3.org/2000/svg"
        xmlSpace="preserve"
        style={{
            fillRule: "evenodd",
            clipRule: "evenodd",
            strokeLinejoin: "round",
            strokeMiterlimit: 2,
        }}
        width="1em"
        height="1em"
        {...props}
    >
        <path
            d="M233.851 156.17c-3.827 5.999-10.525 9.984-18.167 9.984-7.834 0-14.672-4.186-18.449-10.432-.365-.606-1.009-.506-1.009.169v35.73s.071 1.796-.317 3.418c-.507 2.124-2.009 3.479-2.432 4.245-.423.766-.507 1.718-.105 1.85.379.124 1.727-.881 5.637-.881 8.24.223 10.975 2.038 14.341 5.524 5.496 6.606 4.759 11.008 1.77 11.874-1.593.462-3.38-.582-3.38-2.432 0-1.942 1.383-2.934 2.712-3.244 0 0-4.642-8.304-14.262-8.568-6.393-.176-11.054 1.543-16.49 6.131-4.739 3.998-12.13 16.253-25.951 26.759-11.908 9.055-36.217 17.635-36.217 17.635s.915.519 1.181.682c.254.152.974.284 1.133.284.157 0 .545-.102.545-.102l38.287-13.934a3.023 3.023 0 0 1 5.16-1.879l8.431-3.068c-.022-.194-.06-.382-.06-.582a5.39 5.39 0 0 1 9.874-2.99l49.184-17.9s.95-.398 1.483-.592c.533-.193.524-1.58.117-1.896-.327-.252-1.715-1.307-1.715-19.947l-.009-35.851c0-.767-.815-.733-1.292.013Zm-161.08 69.607c-.563-.324-.267-2.039.282-2.577 1.112-1.084 1.403-4.8 1.403-23.123v-37.159l38.899-14.158v61.429c0 9.539 16.779 15.463 18.959 16.141 8.382 2.605 24.237 1.301 30.986-8.654 3.118-4.6 3.367-15.607-5.382-16.077-5.982-.321-10.985 4.177-10.034 9.929.537-.854 1.934-1.256 2.968-.617 1.111.688 1.268 2.248.979 3.066-.314.885-1.387 1.516-2.319 1.516-4.182 0-3.654-8.069-1.884-10.713 1.336-1.994 4.032-5.074 9.857-5.206 5.463-.123 10.075 2.262 12.137 5.221 1.398 2.01 4.627 9.516-1.108 17.815-14.209 18.551-48.778 30.283-48.778 30.283l-45.28-26.143-1.685-.973Zm-20.312-.955c.036-.081.215-.761.063-.841-.53.9-1.825.159-1.825-.527 0-.687.556-1.164 1.268-1.164.714 0 1.587 1.025 1.414 2.309-.318 2.35-2.616 2.35-3.739 1.814-1.548-.739-1.647-2.995-.748-4.052.924-1.089 2.488-1.51 4.017-1.084 1.612.45 3.925 2.085 4.228 6.237.344 4.731-4.017 10.464-13.266 13.212-9.052 2.691-24.633.232-32.31-13.377-2.326-4.122-25.88-49.21 62.893-82.096 15.523-5.751 52.43-19.083 52.43-19.083v6.946s-27.588 9.141-45.968 15.942c-22.5 8.326-51.363 20.532-59.243 34.571 6.501-7.72 23.891-18.709 52.624-29.022 17.611-6.322 52.587-18.973 52.587-18.973v2.96l-52.43 19.081c-2.031.739-19.747 7.658-36.662 16.828-8.033 4.355-23.559 16.035-25.703 33.749-3.806 31.429 23.314 33.242 29.668 31.718 7.775-1.865 16.116-8.204 13.934-14.358-.722-2.037-2.297-3.686-4.105-3.674-1.686.01-2.298 1.189-2.298 2.246 0 .655.538 1.754 1.754 1.647.707-.06 1.177-.473 1.417-1.009Zm81.183-81.329c.002-15.565.007-32.601.007-34.996 0-5.425 4.898-9.402 12.712-13.992 11.673-6.859 15.106-5.082 15.106-5.082s-2.325 1.642-3.901 4.183c-1.316 2.117-1.93 5.077-1.93 6.159v36.502l3.382-1.113v-35.89l5.074-1.847v36.053a91.394 91.394 0 0 0 1.639-.563c3.012-1.096 14.487-4.44 15.221-9.941.582-4.361-2.351-6.312-5.258-6.025-2.405.237-3.449 2.037-3.4 3.99.043 1.629 1.452 2.501 2.343 2.51.634.079 1.321-.08 1.585-.792-.871 1.03-2.167.212-2.194-.793-.015-.565.423-1.424 1.299-1.424 1.047 0 1.926.815 1.661 2.217-.213 1.13-1.387 1.487-2.194 1.533-1.4.079-3.347-.936-3.54-3.119-.23-2.571 1.673-5.478 4.712-5.478 3.594 0 6.836 2.395 6.598 7.196-.342 6.875-12.421 10.227-16.833 11.817-.369.133-.926.326-1.639.568v13.538l27.06-9.856v2.959l-27.06 9.849v4.959l27.06-9.849v6.681s-26.39 9.584-27.06 9.85c-.67.264-2.66.901-3.729.304-.651-.365-1.345-1.008-1.345-2.469v-24.271l-3.382 1.117v25.234c0 3.478-2.221 7.769-8.404 10.986-15.849 8.242-17.265 5.813-17.265 5.813s2.032-.78 3.138-3.242c.568-1.264.568-3.515.544-6.659-.008-1.072-.009-12.303-.007-24.911-3.471 1.143-6.02 1.991-6.758 2.26-2.911 1.058-7.809 2.964-8.385 7.27-.23 1.719.575 4.48 3.494 5.145 1.835.418 3.886-1.013 4.152-2.784.297-1.995-1.504-4.126-3.41-3.497-1.5.497-1.718 2.09-1.202 2.804-.305-1.296.874-1.959 1.757-1.377 1.084.714.751 2.351-.502 2.566-.926.159-1.942-.619-2.008-1.823-.079-1.428 1.017-2.874 2.642-2.96 2.009-.108 3.859 1.531 3.868 3.749.012 3.356-2.928 4.592-4.793 4.575-3.092-.028-5.901-2.692-5.641-6.41.445-6.364 8.37-8.348 10.028-8.95.881-.32 3.399-1.163 6.758-2.274Zm62.585.884v.184s1.103.153 1.388.078c.699-.182 1.069-.621 1.069-.621.274-8.649 6.997-15.662 15.535-16.391.24 4.429.192 15.023.192 15.512 0 .611.552 1.265 1.272 1.265.719 0 1.272-.607 1.272-1.265 0-.526-.047-11.091.191-15.512 8.661.737 15.476 7.942 15.562 16.765v.189c0 9.404-7.62 17.027-17.024 17.027-6.51 0-12.15-3.657-15.012-9.025-.383-.719-.593-1.128-.828-1.789-.322-.347-.895-.608-1.504-.293-.717.37-.807 1.04-.673 1.4.135.359.472 1.111.944 1.977.396.726.835 1.424 1.317 2.093 3.53 4.884 9.265 8.069 15.756 8.069 10.745 0 19.457-8.712 19.457-19.459h.001l-.001-7.658v-6.611h-.002l-.014-63.211v-9.62c0-7.32.978-8.764 1.656-9.055.792-.338.979-1.231.293-1.627a409.403 409.403 0 0 0-1.949-1.111S171.408 8.899 168.741 7.347c-15.5-9.025-43.76-9.695-56.097 7.585-5.911 8.281-9.798 23.25-.1 32.949 4.074 4.073 11.861 5.044 15.592 1.48 3.171-3.03 2.783-6.484 1.708-7.769-1.076-1.286-3.611-1.697-4.844-.547-1.235 1.15-1.275 3.982.296 4.875.937.534 3.156 1.141 4.267-1.448-.318 2.133-1.339 5.999-8.193 5.999-12.667 0-17.952-22.481-4.263-36.117 4.617-4.599 14.482-7.822 24.628-7.822s22.891 6.536 30.942 13.354c8.05 6.819 23.549 26.779 23.549 36.908v87.787l.001-.204ZM74.455 76.69l-1.847.671c-.788.287-.849 2.077.208 3.164.898.925 1.639 6.606 1.639 21.141v36.151l38.899-14.163V94.482c0-10.679 34.116-34.357 37.631-38.005 3.514-3.646 6.553-7.737 6.553-14.181 0-5.884-2.572-10.112-4.439-11.979-1.867-1.868-4.863-3.806-9.936-3.806-4.325 0-8.457 4.201-8.457 8.315 0 4.607 2.432 8.65 7.981 8.65 3.699 0 4.599-1.295 5.355-2.171.194 3.783-2.43 6.79-4.325 8.646-1.894 1.855-7.519 4.267-10.068 5.195L74.455 76.69Zm143.553 48.573h.004-.004Zm-.085-.01.044.005-.04-.005h-.004Zm-.014-.002Zm-4.029-.043h-.004.004Zm.08-.008-.022.002.022-.002Zm.042-.003-.012.001.037-.003-.025.002Z"
            style={{
                fillRule: "nonzero",
            }}
        />
    </svg>
);

export default SvgOfflineIcon;
