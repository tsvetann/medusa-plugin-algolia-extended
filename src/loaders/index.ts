import { MedusaContainer } from "@medusajs/modules-sdk"
import AlgoliaSearchService from "../services/algolia"
import { AlgoliaPluginOptions } from "../types"

export default async (
  container: MedusaContainer,
  options: AlgoliaPluginOptions
) => {
  try {
    const searchService: AlgoliaSearchService = container.resolve("algoliaService")

    const { settings } = options

    await Promise.all(
      Object.entries(settings || {}).map(async ([indexName, value]) => {
        return await searchService.updateSettings(indexName, value)
      })
    )
  } catch (err) {
    // ignore
    console.error(err)
  }
}