import { SearchTypes } from "@medusajs/types"
import { SearchUtils } from "@medusajs/utils"
import Algolia, { SearchClient } from "algoliasearch"
import { MedusaContainer } from "@medusajs/modules-sdk"
import { AlgoliaPluginOptions, SearchOptions } from "../types"
import { transformProduct } from "../utils/transformer"

class AlgoliaSearchService extends SearchUtils.AbstractSearchService {
  isDefault = false

  protected readonly config_: AlgoliaPluginOptions
  protected readonly client_: SearchClient
  protected readonly container_: MedusaContainer

  constructor(container: MedusaContainer, options: AlgoliaPluginOptions) {
    super(container, options)

    this.config_ = options
    this.container_ = container

    const { applicationId, adminApiKey } = options

    if (!applicationId) {
      throw new Error("Please provide a valid Application ID")
    }

    if (!adminApiKey) {
      throw new Error("Please provide a valid Admin Api Key")
    }

    this.client_ = Algolia(applicationId, adminApiKey)
  }

  /**
   * Add two numbers.
   * @param {string} indexName - The name of the index
   * @param {*} options - not required just to match the schema we are used it
   * @return {*}
   */
  createIndex(indexName: string, options: Record<string, unknown> = {}) {
    return this.client_.initIndex(indexName)
  }

  /**
   * Used to get an index
   * @param {string} indexName  - the index name.
   * @return {Promise<{object}>} - returns response from search engine provider
   */
  async getIndex(indexName: string) {
    let hits: Record<string, unknown>[] = []

    return await this.client_
      .initIndex(indexName)
      .browseObjects({
        query: indexName,
        batch: (batch) => {
          hits = hits.concat(batch)
        },
      })
      .then(() => hits)
  }

  /**
   *
   * @param {string} indexName
   * @param {Array} documents - products list array
   * @param {*} type
   * @return {*}
   */
  async addDocuments(indexName: string, documents: any, type: string) {
    const transformedDocuments = await this.getTransformedDocuments(
      type,
      documents
    )

    console.log(`Adding ${transformedDocuments.length} documents to Algolia's ${indexName} index`)
    return await this.client_
      .initIndex(indexName)
      .saveObjects(transformedDocuments)
  }

  /**
   * Used to replace documents
   * @param {string} indexName  - the index name.
   * @param {Object} documents  - array of document objects that will replace existing documents
   * @param {Array.<Object>} type  - type of documents to be replaced (e.g: products, regions, orders, etc)
   * @return {Promise<{object}>} - returns response from search engine provider
   */
  async replaceDocuments(indexName: string, documents: any, type: string) {
    const transformedDocuments = await this.getTransformedDocuments(
      type,
      documents
    )
    return await this.client_
      .initIndex(indexName)
      .replaceAllObjects(transformedDocuments)
  }

  /**
   * Used to delete document
   * @param {string} indexName  - the index name
   * @param {string} documentId  - the id of the document
   * @return {Promise<{object}>} - returns response from search engine provider
   */
  async deleteDocument(indexName: string, documentId: string) {
    return await this.client_.initIndex(indexName).deleteObject(documentId)
  }

  /**
   * Used to delete all documents
   * @param {string} indexName  - the index name
   * @return {Promise<{object}>} - returns response from search engine provider
   */
  async deleteAllDocuments(indexName: string) {
    return await this.client_.initIndex(indexName).delete()
  }

  /**
   * Used to search for a document in an index
   * @param {string} indexName - the index name
   * @param {string} query  - the search query
   * @param {*} options
   * - any options passed to the request object other than the query and indexName
   * - additionalOptions contain any provider specific options
   * @return {*} - returns response from search engine provider
   */
  async search(
    indexName: string,
    query: string,
    options: SearchOptions & Record<string, unknown>
  ) {
    const { paginationOptions, filter, additionalOptions } = options

    // fit our pagination options to what Algolia expects
    if ("limit" in paginationOptions && paginationOptions.limit != null) {
      paginationOptions["length"] = paginationOptions.limit
      delete paginationOptions.limit
    }

    return await this.client_.initIndex(indexName).search(query, {
      filters: filter,
      ...paginationOptions,
      ...additionalOptions,
    })
  }

  /**
   * Used to update the settings of an index
   * @param  {string} indexName - the index name
   * @param {object} settings  - settings object
   * @return {Promise<{object}>} - returns response from search engine provider
   */
  async updateSettings(
    indexName: string,
    settings: SearchTypes.IndexSettings & Record<string, unknown>
  ) {
    // backward compatibility
    const indexSettings = settings.indexSettings ?? settings ?? {}

    return await this.client_.initIndex(indexName).setSettings(indexSettings)
  }

  async getTransformedDocuments(type: string, documents: any[]) {
    if (!documents?.length) {
      return []
    }

    switch (type) {
      case SearchTypes.indexTypes.PRODUCTS:
        const productsTransformer =
          this.config_.settings?.[SearchTypes.indexTypes.PRODUCTS]
            ?.transformer ?? transformProduct

        const transformed = await Promise.allSettled(documents.map(doc => productsTransformer(doc, this.container_)));
        const rejected = <T,>(p: PromiseSettledResult<T>): p is PromiseRejectedResult => p.status === 'rejected';

        const errors = transformed.filter(rejected);
        if (errors.length) {
          console.error('Error transforming products', errors);
        }

        const fulfilled = <T,>(p:PromiseSettledResult<T>): p is PromiseFulfilledResult<T> => p.status === 'fulfilled';

        return transformed.filter(fulfilled).map((r) => r.value);
      default:
        return documents
    }
  }
}

export default AlgoliaSearchService
