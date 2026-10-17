/**
 * Placeholder imagery for the homepage (free Unsplash links).
 * Fictional demo brand — swap these URLs for real photography before any
 * non-demo use. Keyed by collection handle; `hero` and `personalization`
 * are standalone slots.
 */
export const HOME_IMAGES = {
  hero: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1600&q=70",
  personalization:
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1400&q=70",
  collections: {
    "t-shirts":
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=900&q=70",
    poloshirts:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=70",
    "sweatshirts-hoodies":
      "https://images.unsplash.com/photo-1618090584176-7132b9911657?auto=format&fit=crop&w=900&q=70",
    "jacken-westen":
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=900&q=70",
    arbeitshosen:
      "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=900&q=70",
  } as Record<string, string>,
} as const