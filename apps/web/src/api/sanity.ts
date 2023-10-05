import sanityClient from "@sanity/client";

const client = sanityClient({
    projectId: "wsqi2mae",
    dataset: "production",
    apiVersion: "2021-11-14", // use current UTC date - see "specifying API version"!
    token: "", // or leave blank for unauthenticated usage
    useCdn: true, // `false` if you want to ensure fresh data
});

export default client;
