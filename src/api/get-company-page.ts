import client from "./sanity"; //that was galant

interface CompanySectionData {
  sections: [Record<string, unknown>];
}

const query = `
*[_type == "pages"]{
    sections[]{
      content
    }
  }[0].sections
`;

export const fetchCompanySectionData = async (): Promise<CompanySectionData> => {
  const res = await client.fetch(query);
  //pages.forEach((component) => console.log(component.data));
  return res;
};
