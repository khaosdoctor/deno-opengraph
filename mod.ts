import { DOMParser, Element, initParser } from 'https://deno.land/x/deno_dom@v0.1.43/deno-dom-wasm-noinit.ts'

async function parse(html: string) {
  await initParser()
  const doc = new DOMParser().parseFromString(html, 'text/html')
  if (!doc) throw new Error('Could not parse HTML')
  return doc
}

async function fetchAndParseHTML(htmlOrUrl: string) {
  let html = ''
  try {
    const url = new URL(htmlOrUrl)
    html = await (await fetch(url.href)).text()
  } catch {
    html = htmlOrUrl
  }
  return parse(html)
}

type MaybeOpenGraphTags = {
  title?: string
  type?: string
  description?: string
  site_name?: string
  locale?: string | { alternate?: string; content: string }
  image?:
    | string
    | {
        url?: string
        secure_url?: string
        type?: string
        width?: string
        height?: string
        alt?: string
        content: string
      }
  url?: string
  determiner?: string
  [extraKeys: string]: unknown
}

type MaybeTwitterTags = {
  title?: string
  card?: string
  site?: string
  description?: string
  image?: string
  image_alt?: string
  player?: string
  player_width?: string
  player_height?: string
  player_stream?: string
  app_name?: string
  app_id_googleplay?: string
  app_id_iphone?: string
  app_url_googleplay?: string
  app_url_iphone?: string
  app_country?: string
  [extraKeys: string]: unknown
}

/**
 * Extracts all meta tags from a given HTML string or URL
 * @param htmlOrUrl {string} HTML string or URL to parse, if URL is given it will be fetched
 * @param prefix {string} Optional prefix to filter meta tags, e.g. 'og:' or 'twitter:'
 */
export async function getMetaTags(htmlOrUrl: string, prefix = '') {
  const returnObj: Record<string, unknown> = {}
  const doc = await fetchAndParseHTML(htmlOrUrl)
  const meta = doc.querySelectorAll('meta') as Iterable<Element>

  for (const tag of meta) {
    const property = tag.getAttribute('property') || tag.getAttribute('name')
    if (property) {
      if (prefix && !property.startsWith(prefix)) continue

      let nested = property.split(':')
      // With prefix we remove the first element since it's the prefix itself
      if (prefix) nested = nested.slice(1)

      if (nested.length === 1) {
        returnObj[nested[0]] = tag.getAttribute('content') || ''
        continue
      }

      const key = nested[0]
      if (returnObj[key] && typeof returnObj[key] !== 'object') {
        const content = returnObj[key]
        returnObj[key] = { content }
      }

      for (const nestedKey of nested.slice(1)) {
        if (!returnObj[key]) returnObj[key] = {}
        ;(returnObj[key] as Record<string, unknown>)[nestedKey] = tag.getAttribute('content') || ''
      }
    }
  }

  return returnObj
}

/**
 * Extracts all Open Graph meta tags from a given HTML string or URL
 * @param htmlOrUrl {string} HTML string or URL to parse, if URL is given it will be fetched
 */
export function getOGTags(htmlOrUrl: string) {
  return getMetaTags(htmlOrUrl, 'og:') as Promise<MaybeOpenGraphTags>
}

/**
 * Extracts all Twitter meta tags from a given HTML string or URL
 * @param htmlOrUrl {string} HTML string or URL to parse, if URL is given it will be fetched
 */
export function getTwitterTags(htmlOrUrl: string) {
  return getMetaTags(htmlOrUrl, 'twitter:') as Promise<MaybeTwitterTags>
}
