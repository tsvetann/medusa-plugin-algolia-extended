import { ProductService, ProductVariantService } from "@medusajs/medusa";
import { IEventBusService, ISearchService } from "@medusajs/types";
import { defaultSearchIndexingProductRelations } from "@medusajs/utils"
import { indexTypes } from "medusa-core-utils"

type InjectedDependencies = {
  eventBusService: IEventBusService
  algoliaService: ISearchService
  productService: ProductService
}

export default class ProductSearchSubscriber {
  private readonly eventBusService_: IEventBusService
  private readonly searchService_: ISearchService
  private readonly productService_: ProductService

  constructor(container: InjectedDependencies) {
    this.eventBusService_ = container.eventBusService
    this.searchService_ = container.algoliaService
    this.productService_ = container.productService

    this.eventBusService_.subscribe(ProductService.Events.UPDATED, this.handleProductUpdate);
    this.eventBusService_.subscribe(ProductService.Events.CREATED, this.handleProductCreation);
    this.eventBusService_.subscribe(ProductService.Events.DELETED, this.handleProductDeletion);
    this.eventBusService_.subscribe(ProductVariantService.Events.CREATED, this.handleProductVariantChange);
    this.eventBusService_.subscribe(ProductVariantService.Events.UPDATED, this.handleProductVariantChange);
    this.eventBusService_.subscribe(ProductVariantService.Events.DELETED, this.handleProductVariantChange);
  }

  handleProductCreation = async (data) => {
    const product = await this.productService_.retrieve(data.id, {
      relations: defaultSearchIndexingProductRelations,
    })
    await this.searchService_.addDocuments(
      ProductService.IndexName,
      [product],
      indexTypes.products
    )
  }

  handleProductUpdate = async (data): Promise<any> => {
    const { id } = data;
    const product = await this.productService_.retrieve(id, {
      relations: defaultSearchIndexingProductRelations,
    });

    await this.searchService_.addDocuments(
      ProductService.IndexName,
      [product],
      indexTypes.products
    )

    return true;
  }

  handleProductDeletion = async (data) => {
    await this.searchService_.deleteDocument(ProductService.IndexName, data.id)
  }

  handleProductVariantChange = async (data) => {
    const product = await this.productService_.retrieve(data.product_id, {
      relations: defaultSearchIndexingProductRelations,
    })
    await this.searchService_.addDocuments(
      ProductService.IndexName,
      [product],
      indexTypes.products
    )
  }
}