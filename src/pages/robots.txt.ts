export function GET() {
  const site = import.meta.env.SITE
  const sitemap = site ? new URL('/sitemap.xml', site).toString() : '/sitemap.xml'
  const body = `User-agent: *
Allow: /

Sitemap: ${sitemap}
`

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
