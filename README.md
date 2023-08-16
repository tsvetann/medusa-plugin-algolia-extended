# Algolia

Provide powerful indexing and searching features in your commerce application with Algolia.

[Medusa Website](https://medusajs.com) | [Medusa Repository](https://github.com/medusajs/medusa)

## Features

- Flexible configurations for specifying searchable and retrievable attributes.
- Remove draft products from Algolia index
- Utilize Algolia's powerful search functionalities including typo-tolerance, query suggestions, results ranking, and more.
- Access Medusa container inside the transfomer function for unlimited possibilities
- Additional logging, for instance how many documents are sent to Algolia for indexing

---

## Prerequisites

- [Medusa backend](https://docs.medusajs.com/development/backend/install)
- [Algolia account](https://www.algolia.com/)

---

## How to Install

1\. Run the following command in the directory of the Medusa backend:

  ```bash
  npm install medusa-plugin-algolia-extended
  ```

2\. Set the following environment variables in `.env`:

  ```bash
  ALGOLIA_APP_ID=<YOUR_APP_ID>
  ALGOLIA_ADMIN_API_KEY=<YOUR_ADMIN_API_KEY>
  ```

3\. In `medusa-config.js` add the following at the end of the `plugins` array:

  ```js
const plugins = [
  // ...
  {
    resolve: `medusa-plugin-algolia`,
    options: {
      applicationId: process.env.ALGOLIA_APP_ID,
      adminApiKey: process.env.ALGOLIA_ADMIN_API_KEY,
      settings: {
        products: {
          indexSettings: {
            searchableAttributes: ["title", "description"],
            attributesToRetrieve: [
              "id",
              "title",
              "description",
              "handle",
              "thumbnail",
              "variants",
              "variant_sku",
              "options",
              "collection_title",
              "collection_handle",
              "images",
            ],
          },
          transformer: async (product, container) => ({
            objectID: product.id,
            // other attributes...
          }),
        },
      },
    },
  },
]
  ```

---

## Test the Plugin

1\. Run the following command in the directory of the Medusa backend to run the backend:

  ```bash
  npm run start
  ```

---

## Additional Resources

- [Algolia Documentation](https://www.algolia.com/doc/api-client/getting-started/install/javascript/?client=javascript)
