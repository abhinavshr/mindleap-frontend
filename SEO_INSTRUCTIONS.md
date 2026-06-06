SEO setup and react-helmet-async usage

1) Dependency

Install the package (if not already installed):

```bash
npm install react-helmet-async
```

2) Wrap your app

In `src/main.jsx` wrap your app with `HelmetProvider`:

```jsx
import { HelmetProvider } from 'react-helmet-async';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
)
```

3) Per-page meta

In any page component (e.g., `src/pages/HomePage.jsx`) add:

```jsx
import { Helmet } from 'react-helmet-async';

// inside component return:
<Helmet>
  <title>Your Page Title</title>
  <meta name="description" content="Page description" />
  <link rel="canonical" href="https://mindleap.live/your-page" />
  <meta property="og:title" content="Your Page Title" />
  <meta property="og:description" content="Page description" />
  <meta property="og:image" content="https://mindleap.live/path/to/image.png" />
</Helmet>
```

4) Replace placeholders

Replace all `https://mindleap.live/` placeholders with your actual production URL before deploying.

5) Sitemap / robots

`public/sitemap.xml` and `public/robots.txt` were added. Update `sitemap.xml` as you add pages (or generate one dynamically).
