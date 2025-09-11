import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { wordpressSites, title, content, imageUrl, category, author, saveOption, metaTitle, metaDescription, addFeaturedImage, addMetaContent } = body;

    const results = await Promise.all(
      wordpressSites.map(async (site: string) => {
        try {
          const response = await fetch(`${site}/wp-json/apf/v1/create-post`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title,
              content,
              image_url: imageUrl,
              category,
              author,
              status: saveOption === 'draft' ? 'draft' : 'publish',
              meta_title: metaTitle,
              meta_description: metaDescription,
              add_featured_image: addFeaturedImage,
              add_meta_content: addMetaContent
            }),
          });

          if (!response.ok) {
            throw new Error(`Failed to publish to ${site}`);
          }

          return {
            site,
            success: true
          };
        } catch (error) {
          return {
            site,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    const failedSites = results.filter(result => !result.success);
    
    if (failedSites.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Failed to publish',
        failedSites
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully published to WordPress site'
    });

  } catch (error) {
    console.error('Error publishing to WordPress:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to publish to WordPress site'
    }, { status: 500 });
  }
}