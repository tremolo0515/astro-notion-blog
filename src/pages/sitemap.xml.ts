import { getPostLink } from '../lib/blog-helpers'
import { getAllPosts } from '../lib/notion/client'

const xmlEscape = (text: string) =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')

const ensureTrailingSlash = (url: URL) => {
  if (!url.pathname.endsWith('/')) {
    url.pathname = `${url.pathname}/`
  }
  return url.toString()
}

export async function GET() {
  const posts = await getAllPosts()
  const site = import.meta.env.SITE

  if (!site) {
    return new Response('SITE is not configured', { status: 500 })
  }

  const staticUrls = [ensureTrailingSlash(new URL('/', site))]
  const postUrls = posts.map((post) => ({
    loc: ensureTrailingSlash(new URL(getPostLink(post.Slug), site)),
    lastmod: post.Date ? new Date(post.Date).toISOString() : undefined,
  }))

  const staticEntries = staticUrls
    .map((url) => `<url><loc>${xmlEscape(url)}</loc></url>`)
    .join('')
  const postEntries = postUrls
    .map((url) => {
      const lastmod = url.lastmod
        ? `<lastmod>${xmlEscape(url.lastmod)}</lastmod>`
        : ''
      return `<url><loc>${xmlEscape(url.loc)}</loc>${lastmod}</url>`
    })
    .join('')

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticEntries}${postEntries}</urlset>`

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  })
}
