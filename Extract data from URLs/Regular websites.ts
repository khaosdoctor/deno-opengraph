import { MetaTagUrlAndDocument } from '../mod.ts'

export interface WebsiteInfoBase {
	name?: string
	slug?: string
	description?: string
	image?: string
}
interface Website {
	homepage?: WebsiteInfoBase
	post?: WebsiteInfoBase
}

export function extractRegularWebsiteInfo(metaTagUrlAndDocument: MetaTagUrlAndDocument): Website {
	const { meta, document, url } = metaTagUrlAndDocument
	const { pathname } = url
	const htmlTitle = document.querySelector("title")?.textContent
	const htmlTitleSplit = htmlTitle?.split(" - ")
	const metaTitle = meta.og?.title

	const nameWebsite = meta.og?.site_name || htmlTitleSplit?.[1]?.trim() || metaTitle

	if (pathname === "/") {
		return {
			homepage: {
				name: nameWebsite,
				description: meta.og?.description || meta?.description || document.querySelector("p")?.textContent,
				image: meta.og?.image as string,
				slug: nameWebsite?.replace(/\s/g, ""),
			},
		}
	}
	const postName = metaTitle || htmlTitleSplit?.[0].trim()
	return {
		post: {
			name: postName,
			description: meta.og?.description || meta?.description || document.querySelector("p")?.textContent,
			image: meta.og?.image as string,
			slug: createWebsiteSlug(url, postName),
		},
	}

	function createWebsiteSlug(url: URL, postName: string | undefined) {
		const { pathname, hostname } = url
		const pathnameLastSection = pathname.split("/").slice(-1)[0]
		const webExtensions = /\.(htm|html|php)$/
		const fileExtensions = /\.(jpg|png|gif|pdf|doc|docx)$/
		if (webExtensions.test(pathnameLastSection)) return pathnameLastSection.replace(webExtensions, "")
		if (fileExtensions.test(pathnameLastSection)) return pathnameLastSection.replace(".", "")
		return pathnameLastSection
	}
}
