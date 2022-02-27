export const FooterLinks = () => (
  <ul style={{ margin: 0, padding: 0 }}>
    {links.map((link) => (
      <li key={link} style={{ display: "inline-block", margin: 16, fontWeight: "bold" }}>
        {link}
      </li>
    ))}
  </ul>
);
