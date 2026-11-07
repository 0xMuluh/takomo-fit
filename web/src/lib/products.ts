const CDN = "https://cdn.shopify.com/s/files/1/0701/3892/1157/files/";

/** Product photo and store page for each head, from takomogolf.com. */
const HEADS: Record<string, { image: string; page: string }> = {
  "101-mkii": { image: "101_MKII_product_cut.png", page: "iron-101-mkii" },
  "201-mkii": { image: "201_MKII_product_cut.png", page: "iron-201-mkii" },
  "201t-mkii": { image: "201T_MKII_product_cut.png", page: "iron-201t-mkii" },
  "301-cb": { image: "a301CB-2b_062a592c-fe33-45b8-9480-ffa9a34b31fd.png", page: "iron-301-cb" },
  "301-mb": { image: "a301MB-2b_4f53e93b-5944-4dbb-a75a-35d1c8e199dc.png", page: "iron-301-mb" },
};

export const headImage = (slug: string, width = 800) =>
  HEADS[slug] ? `${CDN}${HEADS[slug].image}?width=${width}` : undefined;

export const headPage = (slug: string) =>
  HEADS[slug] ? `https://takomogolf.com/products/${HEADS[slug].page}` : "https://takomogolf.com/";
