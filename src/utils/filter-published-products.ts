import { Product, ProductStatus } from "@medusajs/medusa"

export default function filterPublishedProducts(products: Product[]) {
  if (!Array.isArray(products)) {
    return []
  }

  return products.filter((p) => p.status === ProductStatus.PUBLISHED)
}