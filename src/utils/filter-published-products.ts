import { Product } from "@medusajs/medusa"
import { ProductStatus } from "@medusajs/utils"

export default function filterPublishedProducts(products: Product[]) {
  if (!Array.isArray(products)) {
    return []
  }

  return products.filter((p) => p.status === ProductStatus.PUBLISHED)
}