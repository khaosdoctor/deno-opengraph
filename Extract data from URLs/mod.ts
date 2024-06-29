import { parse } from "npm:tldts";
import { MetaTagUrlAndDocument } from '../mod.ts'
import { FacebookGroup, FacebookEvent, extractFacebookInfo, FacebookPage, FacebookProfile } from "./Facebook.ts";
import { GitHubOrgOrRepo, extractGitHubInfo, extractYouTubeInfo } from "./Social media.ts";
import { DiscordServer, extractDiscordInfo } from "./Chat.ts";
import { NotionDatabase, extractGoogleInfo, extractNotionInfo, NotionWorkspace } from "./SaaS.ts";
import { WebsiteInfoBase, extractRegularWebsiteInfo } from './Regular websites.ts'

const socialMediaList = [
  "Facebook", "LinkedIn",
  "Twitter", "Mastodon",
  "YouTube", "TikTok",
  "Instagram", "Pinterest",
  "Reddit", "Stack Exchange", "Quora", "Tinh tế", "Spiderum", "Medium",
  "GitHub", "GitLab",
  "Zalo",
] as const

const chatList = [
  "Messenger",
  "Discord",
  "Telegram",
  "Zalo",
  "Viber",
  "Reddit",
  "LinkedIn",
] as const;

const SaaSList = ["Google", "Zoom", "Notion"] as const;

type PlatformType = "Social media" | "Chat" | "SaaS" | "Website" 
export interface UrlInfo{
  platformName: string;
  platformType: PlatformType;

  group?: FacebookGroup;
  page?: FacebookPage;
  profile?: FacebookProfile;
  event?: FacebookEvent;

  Org?: GitHubOrgOrRepo;
  Repo?: GitHubOrgOrRepo;

  server?: DiscordServer;

  database?: NotionDatabase;
  workspace?: NotionWorkspace;

  "homepage"?: WebsiteInfoBase;
  "post"?: WebsiteInfoBase;
}

function identifyPlatformNameAndTypeFromUrl(metaTagUrlAndDocument: MetaTagUrlAndDocument): [string, PlatformType] {
  const domainNameWithoutSuffix = parse(metaTagUrlAndDocument.url.href).domainWithoutSuffix;
  if ((socialMediaList as unknown as string[]).includes(domainNameWithoutSuffix)) return [domainNameWithoutSuffix, "Social media"];
  if ((chatList as unknown as string[]).includes(domainNameWithoutSuffix)) return [domainNameWithoutSuffix, "Chat"];
  if ((SaaSList as unknown as string[]).includes(domainNameWithoutSuffix)) return [domainNameWithoutSuffix, "SaaS"];
  return ["Website", "Website"];
}

export default function extractUrlInfo(metaTagUrlAndDocument: MetaTagUrlAndDocument): UrlInfo{
  const [platformName, platformType] = identifyPlatformNameAndTypeFromUrl(metaTagUrlAndDocument);
  const category = getCategory();
  return {
    platformName: platformName,
    platformType: platformType,
    ...category,
  };

  function getCategory() {
    switch (platformName) {
      case "Facebook":
        return extractFacebookInfo(metaTagUrlAndDocument);
      case "GitHub":
        return extractGitHubInfo(metaTagUrlAndDocument);
      case "YouTube":
        return extractYouTubeInfo(metaTagUrlAndDocument);
      case "Discord":
        return extractDiscordInfo(metaTagUrlAndDocument);
      case "Notion":
        return extractNotionInfo(metaTagUrlAndDocument);
      case "Google":
        return extractGoogleInfo(metaTagUrlAndDocument);
      default:
        return extractRegularWebsiteInfo(metaTagUrlAndDocument);
    }
  }
}
