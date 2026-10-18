const IMAGE_ROOT = "/images/workwear"

const CATEGORY_IMAGES: Record<string, string[]> = {
  "t-shirts": [
    `${IMAGE_ROOT}/t-shirt-detail-1.webp`,
    `${IMAGE_ROOT}/t-shirt-detail-2.webp`,
    `${IMAGE_ROOT}/t-shirt-detail-3.webp`,
  ],
  poloshirts: [`${IMAGE_ROOT}/polo-shirts.webp`],
  "sweatshirts-hoodies": [
    `${IMAGE_ROOT}/hoodie.webp`,
    `${IMAGE_ROOT}/sweatshirts-hoodies.webp`,
  ],
  "jacken-westen": [`${IMAGE_ROOT}/jackets-vests.webp`],
  arbeitshosen: [
    `${IMAGE_ROOT}/trousers-detail-1.webp`,
    `${IMAGE_ROOT}/trousers-detail-2.webp`,
    `${IMAGE_ROOT}/trousers-detail-3.webp`,
  ],
}

const PRODUCT_IMAGES: Record<string, string[]> = {
  "heavy-t-shirt": CATEGORY_IMAGES["t-shirts"],
  "team-t-shirt-basic": CATEGORY_IMAGES["t-shirts"],
  "t-shirt-heavy-duty": CATEGORY_IMAGES["t-shirts"],
  "t-shirt-brusttasche": CATEGORY_IMAGES["t-shirts"],
  "langarmshirt-basic": CATEGORY_IMAGES["t-shirts"],
  "polo-shirt-classic": CATEGORY_IMAGES.poloshirts,
  "polo-shirt-premium": CATEGORY_IMAGES.poloshirts,
  "poloshirt-kontrastkragen": CATEGORY_IMAGES.poloshirts,
  "poloshirt-atmungsaktiv": CATEGORY_IMAGES.poloshirts,
  "poloshirt-langarm": CATEGORY_IMAGES.poloshirts,
  "sweatshirt-basic": CATEGORY_IMAGES["sweatshirts-hoodies"],
  "hoodie-work": CATEGORY_IMAGES["sweatshirts-hoodies"],
  "sweatjacke-reissverschluss": CATEGORY_IMAGES["sweatshirts-hoodies"],
  "hoodie-ohne-taschen": CATEGORY_IMAGES["sweatshirts-hoodies"],
  "sweatshirt-logo-platz": CATEGORY_IMAGES["sweatshirts-hoodies"],
  "arbeitshose-classic": CATEGORY_IMAGES.arbeitshosen,
  "arbeitshose-taschen": CATEGORY_IMAGES.arbeitshosen,
  "arbeitshose-stretch": CATEGORY_IMAGES.arbeitshosen,
  "arbeitshose-bundfalten": CATEGORY_IMAGES.arbeitshosen,
  "arbeitshose-leichtgewicht": CATEGORY_IMAGES.arbeitshosen,
  "softshell-jacke": CATEGORY_IMAGES["jacken-westen"],
  arbeitsweste: CATEGORY_IMAGES["jacken-westen"],
  "fleecejacke-warm": CATEGORY_IMAGES["jacken-westen"],
  "arbeitsjacke-multi-tasche": CATEGORY_IMAGES["jacken-westen"],
  "regenjacke-leicht": CATEGORY_IMAGES["jacken-westen"],
}

export const getProductImageUrls = (
  productHandle: string,
  collectionHandle?: string | null
): string[] =>
  PRODUCT_IMAGES[productHandle] ??
  CATEGORY_IMAGES[collectionHandle ?? ""] ??
  []
