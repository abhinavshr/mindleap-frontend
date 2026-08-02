import { Helmet } from "react-helmet-async";

export default function PageHead({ title, description }) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href="https://mindleap.live/" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content="https://mindleap.live/" />
      <meta property="og:image" content="https://mindleap.live/assets/images/logo.png" />
      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
  );
}