const { select } = require('@evershop/postgres-query-builder');
const { buildUrl } = require('@evershop/evershop/src/lib/router/buildUrl');

module.exports = {
  Category: {
    editUrl: (category) => buildUrl('categoryEdit', { id: category.uuid }),
    updateApi: (category) => buildUrl('updateCategory', { id: category.uuid }),
    deleteApi: (category) => buildUrl('deleteCategory', { id: category.uuid }),
    addProductUrl: (category) =>
      buildUrl('addProductToCategory', { category_id: category.uuid })
  },
  Product: {
    removeFromCategoryUrl: async (product, _, { pool }) => {
      if (!product.categoryId) {
        return null;
      } else {
        const category = await select()
          .from('category')
          .where('category_id', '=', product.categoryId)
          .load(pool);
        return buildUrl('removeProductFromCategory', {
          category_id: category.uuid,
          product_id: product.uuid
        });
      }
    }
  }
};
