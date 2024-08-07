# Open Graph and Social Media Metadata for Deno

> Fetches and parses data from website to get their OpenGraph metadata

## Usage

```ts
import { getOGTags, getTwitterTags, getMetaTags } from "https://deno.land/x/opengraph/mod.ts";
// also possible with import * as og from './mod.ts'

// Returns a promise that resolves to an object with the OpenGraph metadata
console.log(await getOGTags('https://deno.land'))
// {
//   title: "Deno, The next-generation JavaScript runtime",
//   description: "Deno features improved security, performance, and developer experience compared to its predecessor. "... 65 more characters,
//   image: {
//     content: "https://deno.com/og/image.png",
//     alt: "A logo of a sauropod in the rain and the word Deno"
//   },
//   type: "website",
//   site_name: "Deno",
//   locale: "en_US"
// }

// Returns a promise that resolves to an object with the Twitter metadata
console.log(await getTwitterTags('https://deno.land'))
// {
//   card: "summary_large_image",
//   site: "@deno_land",
//   title: "Deno, The next-generation JavaScript runtime",
//   description: "Deno features improved security, performance, and developer experience compared to its predecessor. "... 65 more characters,
//   image: {
//     content: "https://deno.com/og/image.png",
//     alt: "A logo of a sauropod in the rain and the word Deno"
//   }
// }

// Returns a promise that resolves to an object with all the metatags that have a name or property attribute
console.log(await getMetaTags('https://deno.land'))
// {
//   viewport: "width=device-width, initial-scale=1.0",
//   robots: "index, follow",
//   twitter: {
//     card: "summary_large_image",
//     site: "@deno_land",
//     title: "Deno, The next-generation JavaScript runtime",
//     description: "Deno features improved security, performance, and developer experience compared to its predecessor. "... 65 more characters,
//     image: "A logo of a sauropod in the rain and the word Deno",
//     alt: "A logo of a sauropod in the rain and the word Deno"
//   },
//   og: {
//     title: "Deno, The next-generation JavaScript runtime",
//     description: "Deno features improved security, performance, and developer experience compared to its predecessor. "... 65 more characters,
//     image: "A logo of a sauropod in the rain and the word Deno",
//     alt: "A logo of a sauropod in the rain and the word Deno",
//     type: "website",
//     site_name: "Deno",
//     locale: "en_US"
//   },
//   description: "Deno features improved security, performance, and developer experience compared to its predecessor. "... 65 more characters,
//   keywords: "deno, denoland, development, javascript, typescript, webassembly, wasm"
// }
```

### Usage with parsed HTML

This lib uses [deno-dom](https://deno.land/x/deno_dom) to parse the HTML, but you can also pass a parsed HTML document to the functions. If you do that, the lib will not fetch the HTML and will only parse the document you passed.

```ts
import { getOGTags, getTwitterTags, getMetaTags } from "https://deno.land/x/opengraph/mod.ts";
import { parse } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

const html = await fetch('https://deno.land').then(res => res.text());

console.log(await getOGTags(html)) // same result
```

## Limitations

[OpenGraph](https://ogp.me) is a long specification with several tags, some of them are nested and this lib will try to parse the nested ones so they form a nice object with all the data. However it does only support two levels of nesting. If you find a website with tags such as `og:music:album:disc`, the tag will be parsed incorrectly. For instance, [App Links metadata](https://developers.facebook.com/docs/applinks/metadata-reference/ "Metadata Reference - App Links") with this syntax:

```html
<meta property="al:ios:url" content="applinks://docs" />
<meta property="al:ios:app_store_id" content="12345" />
<meta property="al:ios:app_name" content="App Links" />
<meta property="al:android:url" content="applinks://docs" />
<meta property="al:android:app_name" content="App Links" />
<meta property="al:android:package" content="org.applinks" />
<meta property="al:web:url" content="http://applinks.org/documentation" />
```

is parsed to this object:
```ts
{
  "al": {
    "ios": "App Links",
    "url": "http://applinks.org/documentation",
    "app_store_id": "12345",
    "app_name": "App Links",
    "android": "org.applinks",
    "package": "org.applinks",
    "web": "http://applinks.org/documentation"
  }
}
```
The support for nested tag is planned for the future.

OpenGraph also has support for arrays, but this lib does not support them yet.
