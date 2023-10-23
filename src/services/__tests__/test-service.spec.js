import AlgoliaSearchService from "../algolia"
import { isSearchService } from "@medusajs/utils/dist/search/is-search-service"

const options = {
  applicationId: 'test',
  adminApiKey: 'test'
}

describe('MyService', () => {
  it('should be recognized by medusa backend', async () => {
    const customService = new AlgoliaSearchService({}, options)
    expect(isSearchService(customService)).toBe(true)
  })
})
