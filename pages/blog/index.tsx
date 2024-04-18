import BlogList from '../../components/blog-list';
import RenderComponents from '../../components/render-components';
import { getBlogListRes, getPageRes } from '../../helper';

import { GetStaticPropsContext } from 'next';
import Skeleton from 'react-loading-skeleton';
import ArchiveRelative from '../../components/archive-relative';
import { Page, PageUrl, PostPage } from "../../typescript/pages";


export default function Blog({ page, posts, archivePost, pageUrl }: { page: Page, posts: PostPage, archivePost: PostPage, pageUrl: PageUrl }) {

  const getBanner = page;

  return (
    <>
      {getBanner.page_components ? (
        <RenderComponents
          pageComponents={getBanner.page_components}
          blogPost
          contentTypeUid='page'
          entryUid={getBanner.uid}
          locale={getBanner.locale}
        />
      ) : (
        <Skeleton height={400} />
      )}
      <div className='blog-container'>
        <div className='blog-column-left'>
          {posts ? (
            posts.map((blogList, index) => (
              <BlogList bloglist={blogList} key={index} />
            ))
          ) : (
            <Skeleton height={400} width={400} count={3} />
          )}
        </div>
        <div className='blog-column-right'>
          {getBanner && getBanner.page_components[1].widget && (
            <h2>{getBanner.page_components[1].widget.title_h2}</h2>
          )}
          {archivePost ? (
            <ArchiveRelative blogs={archivePost} />
          ) : (
            <Skeleton height={600} width={300} />
          )}
        </div>
      </div>
    </>
  );
}

export async function getStaticProps(context: GetStaticPropsContext) {
  try {
    const page = await getPageRes("/blog");
    const result = await getBlogListRes();

    const archivePost = [] as any;
    const posts = [] as any;
    result.forEach((blogs) => {
      if (blogs.is_archived) {
        archivePost.push(blogs);
      } else {
        posts.push(blogs);
      }
    });
    return {
      props: {
        pageUrl: "/blog",
        page,
        posts,
        archivePost,
      },
    };
  } catch (error) {
    console.error(error);
    return { notFound: true };
  }
}
