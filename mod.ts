import { DOMParser, Element, initParser } from 'https://deno.land/x/deno_dom@v0.1.43/deno-dom-wasm-noinit.ts'
import type { MetaTags, OpenGraphTags, TwitterTags } from './type.d.ts'

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

/**
 * Extracts all meta tags from a given HTML string or URL
 * @param htmlOrUrl {string} HTML string or URL to parse, if URL is given it will be fetched
 * @param prefix {string} Optional prefix to filter meta tags, e.g. 'og:' or 'twitter:'
 */
export async function getMetaTags(htmlOrUrl: string, prefix = '') {
  const returnObj: MetaTags = {}
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
  return getMetaTags(htmlOrUrl, 'og:') as Promise<OpenGraphTags|undefined>
}

/**
 * Extracts all Twitter meta tags from a given HTML string or URL
 * @param htmlOrUrl {string} HTML string or URL to parse, if URL is given it will be fetched
 */
export function getTwitterTags(htmlOrUrl: string) {
  return getMetaTags(htmlOrUrl, 'twitter:') as Promise<TwitterTags| undefined>
}

export type { MetaTags, OpenGraphTags, TwitterTags }