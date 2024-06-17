import { parse } from 'npm:tldts'
import {
	FacebookEvent,
	FacebookGroup,
	FacebookPage,
	FacebookProfile,
	parseFacebookURL,
} from './Facebook.ts'
import { MetaTagUrlAndDocument, getMetaTagAndDocument } from '../mod.ts'

export interface GitHubBase {
	name?: string
	slug?: string
	avatar?: string
	description?: string
}
interface GitHub {
	Org?: GitHubBase
	Repo?: GitHubBase
}

export function parseGitHubURL({ meta, url, document }: MetaTagUrlAndDocument): GitHub {
	const htmlTitle = document.querySelector('title')?.textContent
	const htmlTitleSplit = htmlTitle?.split(/ - /g) || []
	let name
	if (htmlTitleSplit[1] === 'GitHub') {
		name = meta.og?.title
		return {
			Org: {
				name: name,
				description: meta.og?.description?.replace(` - ${name}`, ''),
				slug: url.pathname.slice(1),
				avatar: meta.twitter?.image,
			},
		}
	}
	name = htmlTitleSplit[1]
	return {
		Repo: {
			name: name,
			description: meta.og?.description?.replace(` - ${name}`, ''),
			slug: url.pathname.slice(1),
			avatar: meta.twitter?.image,
		},
	}
}
export function parseYouTubeURL({ meta, url }: MetaTagUrlAndDocument) {
	const pathname = url.pathname
	const isChannel = pathname.startsWith('/@') || pathname.startsWith('/channel')
	const isPlaylist = pathname.includes('playlist')

	if (isChannel) {
		return {
			Channel: {
				name: meta.og?.title,
				description: meta.og?.description,
				avatar: meta.twitter?.image,
			},
		}
	}
	if (isPlaylist) {
		return {
			Playlist: {
				name: meta.og?.title,
				description: meta.og?.description,
				avatar: meta.twitter?.image,
			},
		}
	}
	return {
		Video: {
			name: meta.og?.title,
			description: meta.og?.description,
		},
	}
}

interface DiscordServer {
	name: string | undefined
}

interface Discord {
	Server: DiscordServer
}

export function parseDiscordURL({ document }: MetaTagUrlAndDocument): Discord {
	return {
		Server: {
			name: document.querySelector('title')?.textContent,
		},
	}
}

export function parseRegularWebsite(metaTagUrlAndDocument: MetaTagUrlAndDocument) {
	const { meta, document, url } = metaTagUrlAndDocument
	const { pathname } = url
	const htmlTitle = document.querySelector('title')?.textContent
	const htmlTitleSplit = htmlTitle?.split(' - ')
	const metaTitle = meta.og?.title

	if (pathname === '/') {
		return {
			Homepage: {
				name: meta.og?.site_name || htmlTitleSplit?.[1].trim() || metaTitle,
				description: meta.og?.description || meta?.description || document.querySelector('p')?.textContent,
				image: meta.og?.image,
			},
		}
	}
	return {
		Post: {
			name: metaTitle || htmlTitleSplit?.[0].trim(),
			description: meta.og?.description || meta?.description ||
				document.querySelector('p')?.textContent,
			image: meta.og?.image,
		},
	}
}

export interface URLInfo {
	platform: string
	Group?: FacebookGroup
	Page?: FacebookPage
	Profile?: FacebookProfile
	Event?: FacebookEvent

	Org?: GitHubBase
	Repo?: GitHubBase

	Server?: DiscordServer
}

export async function extractInfoFromURL(url: string): Promise<URLInfo> {
  const metaTagUrlAndDocument = await getMetaTagAndDocument(url) 
	const platform = parse(metaTagUrlAndDocument.url.href).domainWithoutSuffix
	const category = getCategory()
	return { platform: platform, ...category }

	function getCategory() {
		switch (platform) {
			case 'facebook':
				return parseFacebookURL(metaTagUrlAndDocument)
			case 'github':
				return parseGitHubURL(metaTagUrlAndDocument)
			case 'youtube':
				return parseYouTubeURL(metaTagUrlAndDocument)
			case 'discord':
				return parseDiscordURL(metaTagUrlAndDocument)
			default:
				return parseRegularWebsite(metaTagUrlAndDocument)
		}
	}
}
