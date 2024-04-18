import { NextApiRequest, NextApiResponse } from "next"

// Cookies to rewrite with SameSite=None (instead of Lax) and Secure
// otherwise they will be dropped in the preview iframe
const REWRITE_COOKIES = ["__prerender_bypass", "__next_preview_data"]

const draft = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.query.secret !== 'MY_SECRET_TOKEN' || !req.query.slug) {
    return res.status(401).json({ message: 'Invalid token' })
  }

  // getPostBySlug would implement the required entry fetching logic to Contentstack
  const post = await getPostBySlug(req.query.slug as string)

  // If the slug doesn't exist prevent draft mode from being enabled
  if (!post) {
    return res.status(401).json({ message: 'Invalid slug' })
  }

  // Enable Draft Mode by setting the cookie
  res.setDraftMode({ enable: true })
  if (req.query.live_preview) {
    const { live_preview, content_type_uid, entry_uid } = req.query;
    // add the live preview hash, content type uid and entry uid in a cookie
    res.setPreviewData({ live_preview, content_type_uid, entry_uid })
  }

  // re-write the cookies - this is needed to ensure the cookies are not dropped
  // by the preview iframe
  const cookies = [...res.getHeader("Set-Cookie") as string[]];
  if (cookies) {
    cookies.forEach((cookie: string, index: number) => {
      const properties = cookie.split("; ")
      properties.forEach((prop) => {
        const [name, value] = prop.split("=")
        if (REWRITE_COOKIES.includes(name)) {
          cookies[index] = `${name}=${value}; HttpOnly; SameSite=None; Secure; Path=/`
        }
      })
    });
    res.setHeader("Set-Cookie", cookies);
  }

  // redirect to the path from the fetched post
  // since the cookie is set, the draft mode will be enabled
  res.redirect(post.slug)
}

// this function should implement the logic to fetch an entry from Contentstack
async function getPostBySlug(slug: string) {
  return {
    slug: slug
  }
}

export default draft;