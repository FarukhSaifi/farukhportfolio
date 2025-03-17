import { Analytics } from "@vercel/analytics/react";
import Document, { Head, Html, Main, NextScript } from "next/document";
import { baseURL, home, person } from "./resources";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Open Graph Meta Tags */}
          <meta property="og:title" content={home.title} />
          <meta
            property="og:image"
            content={`${baseURL}/images/${person.avatar}`}
          />
          <meta property="og:url" content={`https://${baseURL}`} />
          <meta property="og:type" content="website" />

          {/* Apple Card Meta Tags */}
          <link
            rel="apple-touch-icon"
            href={`https://${baseURL}/images/favicon_io/apple-touch-icon.png`}
          />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href={`https://${baseURL}/images/favicon_io/apple-touch-icon.png`}
          />

          {/* Twitter Card Meta Tags */}
          {/* <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={home.title} />
          <meta name="twitter:description" content={home.description} />
          <meta
            name="twitter:image"
            content={`https://${baseURL}/images/${person.cover}`}
          />
          <meta name="twitter:url" content={`https://${baseURL}`} /> */}

          {/* Other meta tags */}
          <link
            rel="manifest"
            href={`https://${baseURL}/images/manifest.json`}
          />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta
            name="apple-mobile-web-app-status-bar-style"
            content="black-translucent"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
          <Analytics />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
