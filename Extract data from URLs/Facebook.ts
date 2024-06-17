import { MetaTagUrlAndDocument } from '../mod.ts'

interface FacebookGroupPageProfileEventBase {
	name?: string
	avatar?: string
	slug?: string
	description?: string
	id?: string | null
	image?: string
}
export type FacebookGroup = FacebookGroupPageProfileEventBase
export type FacebookProfile = FacebookGroupPageProfileEventBase
export type FacebookEvent = FacebookGroupPageProfileEventBase
export type FacebookPage = FacebookGroupPageProfileEventBase 

type FacebookGroupPageProfileEvent =
	| { Group: FacebookGroup }
	| { Page: FacebookPage }
	| { Profile: FacebookProfile }
	| {
		Event: FacebookEvent
	}
interface FacebookPostOrCommentBase {
	title?: string
	content?: string
	image?: string
	contentAuthor?: string
	postingAccount?: string
	id?: string | null
}

type Post = FacebookPostOrCommentBase
type Comment = FacebookPostOrCommentBase

interface FacebookPost {
	Post: Post
}
interface FacebookComment {
	Comment: Comment
}

type Facebook = FacebookGroupPageProfileEvent | FacebookPost | FacebookComment

function parseGroupPageProfileEvent(metaTagUrlAndDocument: MetaTagUrlAndDocument): FacebookGroupPageProfileEvent {
	const { meta, url } = metaTagUrlAndDocument
	const { pathname } = url

	const description = meta.og?.description!
	const ogTitle = meta.og?.title
	const ogImage = meta.og?.image as string
	const alUrl = meta.al?.url || ''
	const descriptionSplitByDot = description?.split('. ')
	const pathnameSplitBySlash = pathname.split('/')

	const isGroup = pathname.includes('group')
	const isProfile = alUrl?.includes('profile')
	const isPage = isProfile && descriptionSplitByDot?.length > 0
		? descriptionSplitByDot[1]?.includes('likes')
		: false

	if (isGroup) {
		return {
			Group: {
				name: ogTitle?.replace(' | Facebook', '') || '',
				description: description,
				avatar: ogImage,
				slug: pathnameSplitBySlash[2],
				id: new URL(alUrl).searchParams.get('id'),
			},
		}
	}
	if (isProfile) {
		const slug = pathnameSplitBySlash[1]
		if (isPage) {
			return {
				Page: {
					name: ogTitle,
					description: descriptionSplitByDot[2],
					avatar: ogImage,
					slug: slug,
				},
			}
		}
		const alUrlSplitBySlash = alUrl?.split('/')
		return {
			Profile: {
				name: ogTitle,
				id: alUrlSplitBySlash[alUrlSplitBySlash.length - 1],
				avatar: ogImage,
				slug: slug,
			},
		}
	}
	return {
		Event: {
			name: ogTitle,
			image: ogImage,
			description: meta.og?.description,
		},
	}
}

function parseFacebookPostURL(metaTagUrlAndDocument: MetaTagUrlAndDocument): FacebookPost {
	const { meta, url } = metaTagUrlAndDocument
	const { pathname, searchParams } = url
	const pathnameSplitBySlash = pathname.split('/')

	const description = meta.og?.description!
	const ogImage = meta.og?.image as string

	const descriptionSplitByNewLine = description?.split('\n')
	let title = ''
	let content = description
	if (description?.includes('\n')) {
		title = descriptionSplitByNewLine[0].replace(/^#/g, '').trim()
		descriptionSplitByNewLine.shift()!
		content = descriptionSplitByNewLine.join(' ').replace(/\s\s+/g, ' ').trim()
	}
	return {
		Post: {
			title: title,
			content: content,
			image: ogImage,
			id: getPostId(searchParams, pathnameSplitBySlash),
		},
	}
}

function getPostId(
	searchParams: URLSearchParams,
	pathnameSplitBySlash: string[],
): string | null | undefined {
	if (searchParams.has('id')) return searchParams.get('id')
	return !Number.isNaN(parseInt(pathnameSplitBySlash[3]))
		? pathnameSplitBySlash[3]
		: pathnameSplitBySlash[4]
}

function parseFacebookCommentURL(
	metaTagUrlAndDocument: MetaTagUrlAndDocument,
): Facebook {
	const { meta, url } = metaTagUrlAndDocument
	const { pathname, searchParams } = url
	const pathnameSplitBySlash = pathname.split('/')

	const description = meta.og?.description!
	const ogTitle = meta.og?.title
	const alUrl = meta.al?.url

	return {
		Comment: {
			content: description,
			contentAuthor: ogTitle,
			postingAccount: ogTitle,
			id: searchParams.get('comment_id'),
		},
	}
}

export function parseFacebookURL(metaTagUrlAndDocument: MetaTagUrlAndDocument): Facebook {
	const { pathname, searchParams } = metaTagUrlAndDocument.url

	const isComment = searchParams.has('comment_id')
	const isPost = pathname.includes('posts') || searchParams.has('story_fbid')

	if (isComment) return parseFacebookCommentURL(metaTagUrlAndDocument)
	if (isPost) return parseFacebookPostURL(metaTagUrlAndDocument)
	return parseGroupPageProfileEvent(metaTagUrlAndDocument)
}
