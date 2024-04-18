import parse from 'html-react-parser';
import moment from 'moment';
import { GetStaticPropsContext } from 'next';
import Skeleton from 'react-loading-skeleton';
import ArchiveRelative from '../../components/archive-relative';
import RenderComponents from '../../components/render-components';
import { Stack } from '../../contentstack-sdk';
import { getBlogListRes, getBlogPostRes, getPageRes } from '../../helper';
import { BlogPosts, Page, PageUrl } from "../../typescript/pages";


export default function BlogPost({ post, page: page }: { post: BlogPosts, page: Page, pageUrl: PageUrl }) {

  return (
    <>
      {page ? (
        <RenderComponents
          pageComponents={page.page_components}
          blogPost
          contentTypeUid='blog_post'
          entryUid={page?.uid}
          locale={page?.locale}
        />
      ) : (
        <Skeleton height={400} />
      )}
      <div className='blog-container'>
        <article className='blog-detail'>
          {post && post.title ? (
            <h2 {...post.$?.title as {}}>{post.title}</h2>
          ) : (
            <h2>
              <Skeleton />
            </h2>
          )}
          {post && post.date ? (
            <p {...post.$?.date as {}}>
              {moment(post.date).format('ddd, MMM D YYYY')},{' '}
              <strong {...post.author[0].$?.title as {}}>
                {post.author[0].title}
              </strong>
            </p>
          ) : (
            <p>
              <Skeleton width={300} />
            </p>
          )}
          {post && post.body ? (
            <div {...post.$?.body as {}}>{parse(post.body)}</div>
          ) : (
            <Skeleton height={800} width={600} />
          )}
        </article>
        <div className='blog-column-right'>
          <div className='related-post'>
            {page && page?.page_components[2].widget ? (
              <h2 {...page?.page_components[2].widget.$?.title_h2 as {}}>
                {page?.page_components[2].widget.title_h2}
              </h2>
            ) : (
              <h2>
                <Skeleton />
              </h2>
            )}
            {post && post.related_post ? (
              <ArchiveRelative
                {...post.$?.related_post}
                blogs={post.related_post}
              />
            ) : (
              <Skeleton width={300} height={500} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export async function getStaticProps(context: GetStaticPropsContext) {
  const page = await getPageRes('/blog');
  const { params, previewData } = context;
  if (!params) {
    return { notFound: true };
  }
  try {
    if (typeof previewData === "object" && "live_preview" in previewData) {
      // provide live preview hash to Contentstack SDK
      const livePreviewData = previewData as { content_type_uid: string, live_preview: string, entry_uid: string; };
      console.log("live previewing")
      Stack.livePreviewQuery(livePreviewData)
    }
    else {
      // reset hash if live preview hash is not found in preview data
      Stack.livePreviewQuery({ live_preview: "", content_type_uid: "" })
    }
    const post = await getBlogPostRes(`/blog/${params.post}`);
    console.log("blog post", post)
    if (!page || !post) throw new Error('404');

    return {
      props: {
        pageUrl: `/blog/${params.post}`,
        post,
        page,
      },
    };
  } catch (error) {
    console.error(error);
    return { notFound: true };
  }
}

export async function getStaticPaths() {
  const posts = await getBlogListRes();
  const postsUrls = posts.map((post) => ({ params: { post: post.url } }))
  return {
    paths: postsUrls,
    fallback: true,
  }
}