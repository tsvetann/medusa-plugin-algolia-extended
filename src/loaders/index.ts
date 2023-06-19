import { MedusaContainer } from "@medusajs/modules-sdk"
import SearchService from "../services/search"
import { AlgoliaPluginOptions } from "../types"

export default async (
  container: MedusaContainer,
  options: AlgoliaPluginOptions
) => {
  try {
    const searchService: SearchService = container.resolve("searchService")

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