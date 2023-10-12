import { ProductService, ProductVariantService, Logger, ProductStatus } from "@medusajs/medusa";
import { IEventBusService, ISearchService } from "@medusajs/types";
import { defaultSearchIndexingProductRelations } from "@medusajs/utils"
import { indexTypes } from "medusa-core-utils"

const productRelations = [...defaultSearchIndexingProductRelations, "categories"]

type InjectedDependencies = {
  eventBusService: IEventBusService
  searchService: ISearchService
  productService: ProductService
  logger: Logger
}

export default class ProductSearchSubscriber {
  private readonly eventBusService_: IEventBusService
  private readonly searchService_: ISearchService
  private readonly productService_: ProductService
  private readonly logger_: Logger

  constructor(container: InjectedDependencies) {
    this.eventBusService_ = container.eventBusService
    this.searchService_ = container.searchService
    this.productService_ = container.productService
    this.logger_ = container.logger

    this.eventBusService_.subscribe(ProductService.Events.UPDATED, this.handleProductUpdate);
    this.eventBusService_.subscribe(ProductService.Events.CREATED, this.handleProductCreation);
    this.eventBusService_.subscribe(ProductService.Events.DELETED, this.handleProductDeletion);
    this.eventBusService_.subscribe(ProductVariantService.Events.CREATED, this.handleProductVariantChange);
    this.eventBusService_.subscribe(ProductVariantService.Events.UPDATED, this.handleProductVariantChange);
    this.eventBusService_.subscribe(ProductVariantService.Events.DELETED, this.handleProductVariantChange);
  }

  handleProductCreation = async (data) => {
    try {
      const product = await this.productService_.retrieve(data.id, {
        relations: productRelations,
      })
      await this.searchService_.addDocuments(
        ProductService.IndexName,
        [product],
        indexTypes.products
      )

      this.logger_.info('Added 1 product to search index')
    } catch (error) {
      this.logger_.error('Failed adding product to search index', error)
    }
  }

  handleProductUpdate = async (data): Promise<any> => {
    try {
      const { id } = data;
      const product = await this.productService_.retrieve(id, {
        relations: productRelations,
      });

      if (product.status !== ProductStatus.PUBLISHED) {
        this.logger_.info('Removing product from index because it was unpublished')
        await this.searchService_.deleteDocument(ProductService.IndexName, id);
        return true;
      } else {
        await this.searchService_.addDocuments(
          ProductService.IndexName,
          [product],
          indexTypes.products
        )
        this.logger_.info('Published 1 product to search index')
      }
    } catch (error) {
      this.logger_.error('Failed to update product to search index', error)
    }

    return true;
  }

  handleProductDeletion = async (data) => {
    try {
      await this.searchService_.deleteDocument(ProductService.IndexName, data.id)
    } catch (error) {
      this.logger_.error('Failed to remove product from index', error)
    }

    this.logger_.info('Removed product from search index')
  }

  handleProductVariantChange = async (data) => {
    try {
      const product = await this.productService_.retrieve(data.product_id, {
        relations: productRelations,
      })
      await this.searchService_.addDocuments(
        ProductService.IndexName,
        [product],
        indexTypes.products
      )

      this.logger_.info('Updated product in search index for variant update')
    } catch (error) {
      this.logger_.error('Failed to update search index for variant update', error)
    }
  }
}