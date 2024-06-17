/**
 * @see https://ogp.me/
 */
export type OpenGraphTags = {
  title?: string
  type?: string
  description?: string
  site_name?: string
  locale?: string | { alternate?: string; content: string }
  image?:
    | string
    | {
        url?: string
        secure_url?: string
        type?: string
        width?: string
        height?: string
        alt?: string
        content: string
      }
  url?: string
  determiner?: string
  [extraKeys: string]: unknown
}

/**
 * @see https://developer.x.com/en/docs/twitter-for-websites/cards/overview/markup
 */
export type TwitterTags = {
  title?: string
  card?: string
  site?: string
  description?: string
  image?: string
  image_alt?: string
  player?: string
  player_width?: string
  player_height?: string
  player_stream?: string
  app_name?: string
  app_id_googleplay?: string
  app_id_iphone?: string
  app_url_googleplay?: string
  app_url_iphone?: string
  app_country?: string
  [extraKeys: string]: unknown
}

export type MetaTags = {
  /**
   * Defined from HTML specification
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta/name
   */
  "application-name"?: string;
  author?: string;
  description?: string;
  generator?: string;
  keywords?: string;
  referrer?: string;
  "theme-color"?: string;
  "color-scheme"?: string;
  viewport?: string;

  /**
   * Defined from other specifications
   */
  creator?: string;
  googlebot?: string;
  bingbot?: string;
  robots?: string;
  publisher?: string;
  "apple-itunes-app"?: string
  "application-url"?: string
  
  /**
   * Defined from Open Graph specification
  */
 og?: OpenGraphTags;
 al?: {
   android?: string
   app_name?: string
   package?: string
   url?: string
   ios?: string
   app_store_id?: string
 },
  article?: {
    publish_time?: string;
    modified_time?: string;
    expiration_time?: string;
    author?: string;
    section?: string;
    tag?: string;
  };
  book?: {
    author?: string;
    isbn?: string;
    release_date?: string;
    tag?: string;
  };
  profile?: {
    first_name?: string;
    last_name?: string;
    username?: string;
    gender?: string;
  };

  twitter?: TwitterTags,
  [extraKeys: string]: unknown;
};
