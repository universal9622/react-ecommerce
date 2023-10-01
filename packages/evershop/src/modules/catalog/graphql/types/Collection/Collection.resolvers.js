const { select } = require('@evershop/postgres-query-builder');
const { camelCase } = require('@evershop/evershop/src/lib/util/camelCase');
const { ProductCollection } = require('../../../services/ProductCollection');
const {
  getProductsByCollectionBaseQuery
} = require('../../../services/getProductsByCollectionBaseQuery');
const {
  getCollectionsBaseQuery
} = require('../../../services/getCollectionsBaseQuery');
const {
  CollectionCollection
} = require('../../../services/CollectionCollection');

module.exports = {
  Query: {
    collection: async (_, { code }, { pool }) => {
      const query = select().from('collection');
      query.where('code', '=', code);
      const result = await query.load(pool);
      return result ? camelCase(result) : null;
    },
    collections: async (_, { filters = [] }) => {
      const query = getCollectionsBaseQuery();
      const root = new CollectionCollection(query);
      await root.init({}, { filters });
      return root;
    }
  },
  Collection: {
    products: async (collection, { filters = [] }, { user }) => {
      const query = getProductsByCollectionBaseQuery(collection.collectionId);
      const root = new ProductCollection(query);
      await root.init(collection, { filters }, { user });
      return root;
    }
  },
  Product: {
    collections: async (product, _, { pool }) => {
      const query = getCollectionsBaseQuery();
      query
        .leftJoin('product_collection')
        .on(
          'collection.collection_id',
          '=',
          'product_collection.collection_id'
        );
      query.where('product_id', '=', product.productId);
      return (await query.execute(pool)).map((row) => camelCase(row));
    }
  }
};
