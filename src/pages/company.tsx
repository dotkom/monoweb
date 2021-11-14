import { CompanyView } from "@components/views/CompanyView";
import { GetServerSideProps, GetStaticProps } from "next";
import React from "react";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const query = `
  *[_type == "pages"]{
    sections[2]{
      content
    }
  }`;
  const result = await fetch(
    "https://wsqi2mae.api.sanity.io/v1/data/query/production?query=*%5B_type%20%3D%3D%20%22pages%22%5D%7B%0A%20%20sections%5B2%5D%7B%0A%20%20%20%20content%0A%20%20%7D%0A%7D%5B0%5D"
  );
  const data = await result.json();
  return { props: { data: data.result } };
};
const Company: React.FC = (props) => {
  console.log(props);
  console.log("hello world");

  return <CompanyView props={props.data} />;
};

export default Company;
