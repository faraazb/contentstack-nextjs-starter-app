import { GetStaticPropsContext } from 'next';
import Skeleton from 'react-loading-skeleton';
import RenderComponents from '../components/render-components';
import { Stack } from '../contentstack-sdk';
import { getPageRes } from '../helper';
import { Props } from "../typescript/pages";

export default function Page(props: Props) {
  const { page } = props;

  return page ? (
    <RenderComponents
      pageComponents={page.page_components}
      contentTypeUid='page'
      entryUid={page.uid}
      locale={page.locale}
    />
  ) : (
    <Skeleton count={3} height={300} />
  );
}

export async function getStaticProps(context: GetStaticPropsContext) {
  const { previewData, params } = context;
  console.log("Context", context)

  if (typeof params === "undefined") {
    return { notFound: true };
  }
  try {
    if (typeof previewData === "object" && "live_preview" in previewData) {
      const livePreviewData = previewData as { content_type_uid: string, live_preview: string, entry_uid: string; };
      // provide live preview hash to Contentstack SDK
      Stack.livePreviewQuery(livePreviewData)
    }
    else {
      // reset hash if live preview hash is not found in preview data
      Stack.livePreviewQuery({ live_preview: "", content_type_uid: "" })
    }
    const pageUrl = params.page !== "home" ? `/${params.page}` : "/"
    const entryRes = await getPageRes(pageUrl);
    return {
      props: {
        entryUrl: pageUrl,
        page: entryRes,
      },
    };
  } catch (error) {
    console.log(error)
    return { notFound: true };
  }
}

export async function getStaticPaths() {
  return {
    paths: [
      {
        params: {
          page: "home",
        }
      },
      {
        params: {
          page: "contact-us"
        }
      },
      {
        params: {
          page: "about-us"
        }
      }
    ],
    fallback: false,
  }
}