import { MetaTagUrlAndDocument, } from '../mod.ts'

export interface GitHubOrgOrRepo {
  name?: string;
  slug?: string;
  avatar?: string;
  description?: string;
}
interface GitHub {
  Org?: GitHubOrgOrRepo;
  Repo?: GitHubOrgOrRepo;
}
export function extractGitHubInfo({ meta, url, document }: MetaTagUrlAndDocument): GitHub {
  const htmlTitle = document.querySelector("title")?.textContent;
  const htmlTitleSplit = htmlTitle?.split(/ - /g) || [];
  let name;
  if (htmlTitleSplit[1] === "GitHub") {
    name = meta.og?.title;
    return {
      Org: {
        name: name,
        description: meta.og?.description?.replace(` - ${name}`, ""),
        slug: url.pathname.slice(1),
        avatar: meta.twitter?.image,
      },
    };
  }
  name = htmlTitleSplit[1];
  return {
    Repo: {
      name: name,
      description: meta.og?.description?.replace(` - ${name}`, ""),
      slug: url.pathname.slice(1),
      avatar: meta.twitter?.image,
    },
  };
}
export function extractYouTubeInfo({ meta, url }: MetaTagUrlAndDocument) {
  const pathname = url.pathname;
  const isChannel = pathname.startsWith("/@") || pathname.startsWith("/channel");
  const isPlaylist = pathname.includes("playlist");

  if (isChannel) {
    return {
      channel: {
        name: meta.og?.title,
        description: meta.og?.description,
        avatar: meta.twitter?.image,
      },
    };
  }
  if (isPlaylist) {
    return {
      playlist: {
        name: meta.og?.title,
        description: meta.og?.description,
        avatar: meta.twitter?.image,
      },
    };
  }
  return {
    video: {
      name: meta.og?.title,
      description: meta.og?.description,
    },
  };
}
