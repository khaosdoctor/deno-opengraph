/**
 * Names are only available in groups, pages, profiles, events. They can be used as slugs.
 * Titles are only available in posts, comments, videos. They cannot be used as slugs.
 */
import { MetaTagUrlAndDocument} from '../mod.ts'


interface GroupPageProfileEventBase {
  name?: string;
  avatar?: string;
  slug?: string;
  description?: string;
  creatingAccount?: string;
  createdDate?: string;
  id?: string | null;
  image?: string;
}
export type FacebookGroup = GroupPageProfileEventBase;
export type FacebookProfile = GroupPageProfileEventBase;
export type FacebookEvent = GroupPageProfileEventBase;
export type FacebookPage = GroupPageProfileEventBase & { likes?: number };

type GroupPageProfileEvent = { group: FacebookGroup } | { page: FacebookPage } | { profile: FacebookProfile } | {
  event: FacebookEvent;
};
interface PostCommentInfo {
  title?: string;
  content?: string;
  image?: string;
  contentAuthor?: string;
  postingAccount?: string;
  postedDate?: string;
  id?: string | null;
}

interface Video {
  video: {
    title?: string;
    description?: string;
    contentAuthor?: string;
    postingAccount?: string;
    postedDate?: string;
    id?: string | null;
  };
}
interface Post {
  post: PostCommentInfo;
}
interface Comment {
  comment: PostCommentInfo;
}

type ThôngTinUrlFacebook = GroupPageProfileEvent | Post | Comment | Video;

function extractGroupPageProfileInfo(metaTagUrlAndDocument: MetaTagUrlAndDocument): GroupPageProfileEvent {
  const { meta, url } = metaTagUrlAndDocument;
  const { pathname } = url;

  const description = meta.og?.description!;
  const ogTitle = meta.og?.title;
  const ogImage = meta.og?.image as string;
  const alUrl = meta.al?.url!;
  const descriptionSplitByDot = description?.split(". ");
  const pathnameSplitBySlash = pathname.split("/");

  const isGroup = pathname.includes("group");
  const isProfile = alUrl?.includes("profile");
  const isPage = isProfile && descriptionSplitByDot?.length > 0 ? descriptionSplitByDot[1]?.includes("likes") : false;

  if (isGroup) {
    return {
      group: {
        name: ogTitle?.replace(" | Facebook", "") || "",
        description: description,
        avatar: ogImage,
        slug: pathnameSplitBySlash[2],
        id: new URL(alUrl).searchParams.get("id"),
      },
    };
  }
  if (isProfile) {
    const slug = pathnameSplitBySlash[1];
    if (isPage) {
      return {
        page: {
          name: ogTitle,
          likes: parseInt(descriptionSplitByDot[1].split(" ")[0].replace(".", "")),
          description: descriptionSplitByDot[2],
          avatar: ogImage,
          slug: slug,
        },
      };
    }
    const alUrlSplitBySlash = alUrl?.split("/");
    return {
      profile: {
        name: ogTitle,
        id: alUrlSplitBySlash[alUrlSplitBySlash.length - 1],
        avatar: ogImage,
        slug: slug,
      },
    };
  }
  return {
    event: {
      name: ogTitle,
      image: ogImage,
      description: meta.og?.description,
    },
  };
}

function extractPostInfo(metaTagUrlAndDocument: MetaTagUrlAndDocument): Post {
  const { meta, url } = metaTagUrlAndDocument;
  const { pathname, searchParams } = url;
  const pathnameSplitBySlash = pathname.split("/");

  const description = meta.og?.description!;
  const ogImage = meta.og?.image as string;

  const { title, content } = extractTitleAndContentFromDescription(description);
  return {
    "post": {
      title: title,
      content: content,
      image: ogImage,
      postingAccount: pathnameSplitBySlash[1],
      id: extractPostId(searchParams, pathnameSplitBySlash),
    },
  };
}

function extractTitleAndContentFromDescription(description?: string) {
  const descriptionSplitByNewLine = description?.trim().split("\n");
  let title = undefined;
  let content = description;
  if (descriptionSplitByNewLine && descriptionSplitByNewLine.length > 1) {
    title = descriptionSplitByNewLine[0].replace(/^#*?/g, "").trim();
    descriptionSplitByNewLine.shift();
    content = descriptionSplitByNewLine.join(" ").replace(/\s\s+/g, " ").trim();
  }
  return { title, content };
}

function extractPostId(searchParams: URLSearchParams, pathnameSplitBySlash: string[]): string | null | undefined {
  if (searchParams.has("id")) return searchParams.get("id");
  return !Number.isNaN(Number(pathnameSplitBySlash[3])) ? pathnameSplitBySlash[3] : pathnameSplitBySlash[4];
}

function extractCommentInfo(metaTagUrlAndDocument: MetaTagUrlAndDocument): ThôngTinUrlFacebook {
  const { meta, url } = metaTagUrlAndDocument;
  const { pathname, searchParams } = url;
  const pathnameSplitBySlash = pathname.split("/");

  const description = meta.og?.description!;
  const ogTitle = meta.og?.title;
  const alUrl = meta.al?.url;

  return {
    comment: {
      content: description,
      contentAuthor: ogTitle,
      postingAccount: ogTitle,
      id: searchParams.get("comment_id"),
    },
  };
}

function extractVideoInfo({ meta, url }: MetaTagUrlAndDocument): Video {
  const { description, title } = meta.og!;
  const pathnameSplitBySlash = url.pathname.split("/");

  return {
    video: {
      title: title?.split("|")[0].trim() || description,
      description: description,
      id: pathnameSplitBySlash[4],
      postingAccount: pathnameSplitBySlash[1],
    },
  };
}

export function extractFacebookInfo(metaTagUrlAndDocument: MetaTagUrlAndDocument): ThôngTinUrlFacebook {
  const { pathname, searchParams } = metaTagUrlAndDocument.url;

  const isComment = searchParams.has("comment_id");
  const isPost = pathname.includes("posts") || searchParams.has("story_fbid");
  const isVideo = pathname.includes("videos");

  if (isComment) return extractCommentInfo(metaTagUrlAndDocument);
  if (isPost) return extractPostInfo(metaTagUrlAndDocument);
  if (isVideo) return extractVideoInfo(metaTagUrlAndDocument);
  return extractGroupPageProfileInfo(metaTagUrlAndDocument);
}
