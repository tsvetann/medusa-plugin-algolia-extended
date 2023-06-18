import SearchService from "services/search";
import { EntityManager } from "typeorm";
import { ProductService, ProductVariantService } from "@medusajs/medusa";
import { IEventBusService } from "@medusajs/types";
import { defaultSearchIndexingProductRelations } from "@medusajs/utils"
import { indexTypes } from "medusa-core-utils"

export default class MySubscriber {
  protected readonly searchService_: SearchService
  protected readonly productService_: ProductService

  constructor(
    {
      eventBusService,
      searchService,
      productService
    }: {
      manager: EntityManager;
      eventBusService: IEventBusService;
      searchService: SearchService;
      productService: ProductService;
    }
  ) {
    this.searchService_ = searchService;
    this.productService_ = productService;

    eventBusService.subscribe(ProductService.Events.UPDATED, this.handleProductUpdate);
    eventBusService.subscribe(ProductService.Events.CREATED, this.handleProductCreation);
    eventBusService.subscribe(ProductService.Events.DELETED, this.handleProductDeletion);
    eventBusService.subscribe(ProductVariantService.Events.CREATED, this.handleProductVariantChange);
    eventBusService.subscribe(ProductVariantService.Events.UPDATED, this.handleProductVariantChange);
    eventBusService.subscribe(ProductVariantService.Events.DELETED, this.handleProductVariantChange);
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