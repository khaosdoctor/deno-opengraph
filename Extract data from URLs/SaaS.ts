import { parse } from "npm:tldts";
import punycode from "npm:punycode";
import { MetaTagUrlAndDocument} from '../mod.ts'

function getSubdomain(hostname: string) {
  const { domainWithoutSuffix, subdomain } = parse(punycode.toUnicode(hostname));
  const platforms = ["deno", "wordpress", "medium", "tumplr", "wix", "blogger", "substack", "notion", "quảcầu"];
  if (platforms.includes(domainWithoutSuffix)) return subdomain;
  return domainWithoutSuffix;
}

export interface NotionDatabase {
  name: string;
  username: string;
  slug: string;
}
export interface NotionWorkspace {
  username: string;
}
interface Notion {
  database?: NotionDatabase;
  workspace?: NotionWorkspace;
}
export function extractNotionInfo({ url }: MetaTagUrlAndDocument): Notion {
  const { pathname, hostname } = url;
  const username = getSubdomain(hostname);
  const temp = pathname.slice(1).split("-");
  temp.pop();
  const databaseName = temp.join(" ");
  if (databaseName) {
    return {
      database: {
        name: databaseName,
        username: username,
        slug: temp.join("-"),
      },
    };
  }
  return {
    workspace: {
      username: username,
    },
  };
}

interface GoogleBase {
  title: string;
  description: string;
  slug: string;
}
type Google = Record<string, GoogleBase | Record<string | number | symbol, never>>;
export function extractGoogleInfo({ url, meta }: MetaTagUrlAndDocument): Google {
  const { pathname } = url;
  if (!meta.og) {
    return {
      File: {},
    };
  }

  const { title, description } = meta.og;
  const googleBase: GoogleBase = {
    title: title!,
    description: description!,
    slug: title!.replaceAll(' ', '-')
  };

  const service = pathname.split("/")[1]
  return { [service]: googleBase };
}
