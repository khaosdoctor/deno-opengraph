import { getMetaTags } from './mod.ts'
import { MetaTags } from './type.d.ts'
import { DOMParser, HTMLDocument } from "jsr:@b-fuze/deno-dom";

interface MetaTagsUrlAndDocument {
  meta: MetaTags;
  url: URL;
  document: HTMLDocument;
}

export async function getOgUrlAndDocument(urlString: URL | string, HTML: string | undefined = undefined): Promise<MetaTagsUrlAndDocument> {
  const url = new URL(urlString);
  const html = HTML ? HTML : await (await fetch(url)).text();
  const meta = await getMetaTags(html) as MetaTags;
  if (!meta?.og) console.warn(`Cannot get Open Graph tags for ${url.href}`);
  const document = new DOMParser().parseFromString(html, "text/html");

  return { meta, url, document };
}

export function getTitle({ meta, document }: MetaTagsUrlAndDocument): string {
  const title = document.querySelector("title")?.textContent || meta.og?.title;
  if (!title) return "";
  const titleSplit = title.split(" | ");
  titleSplit.pop();
  return titleSplit.join(" | ") || title;
}

export function getDomain(hostname: string) {
  const TLDs = new RegExp(
    /\.(com|net|org|biz|ltd|plc|edu|mil|asn|adm|adv|arq|art|bio|cng|cnt|ecn|eng|esp|etc|eti|fot|fst|g12|ind|inf|jor|lel|med|nom|ntr|odo|ppg|pro|psc|psi|rec|slg|tmp|tur|vet|zlg|asso|presse|k12|gov|muni|ernet|res|store|firm|arts|info|mobi|maori|iwi|travel|asia|web|tel)(\.[a-z]{2,3})?$|(\.[^\.]{2,3})(\.[^\.]{2,3})$|(\.[^\.]{2})$/,
  );
  return hostname.replace(TLDs, "").split(".").pop();
}

export function getDescription({ meta, document }: MetaTagsUrlAndDocument): string | null | undefined {
  return meta?.description || document.querySelector("p")?.textContent || meta.og?.description;
}

export function getTopics(meta: MetaTags): string[] | undefined {
  if (meta?.keywords) return meta.keywords.split(",");
  if (meta?.article?.tag) return [meta.article?.tag];
  return undefined;
}
