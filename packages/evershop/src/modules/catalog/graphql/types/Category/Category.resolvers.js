const { select, node, execute } = require('@evershop/postgres-query-builder');
const uniqid = require('uniqid');
const { buildUrl } = require('@evershop/evershop/src/lib/router/buildUrl');
const { camelCase } = require('@evershop/evershop/src/lib/util/camelCase');
const {
  getProductsByCategoryBaseQuery
} = require('../../../services/getProductsByCategoryBaseQuery');
const { pool } = require('@evershop/evershop/src/lib/postgres/connection');
const {
  getFilterableAttributes
} = require('../../../services/getFilterableAttributes');
const { getConfig } = require('@evershop/evershop/src/lib/util/getConfig');

module.exports = {
  Query: {
    category: async (_, { id }) => {
      const query = select().from('category');
      query
        .leftJoin('category_description')
        .on(
          'category_description.category_description_category_id',
          '=',
          'category.category_id'
        );
      query.where('category_id', '=', id);
      const result = await query.load(pool);
      return result ? camelCase(result) : null;
    },
    categories: async (_, { filters = [] }) => {
      const query = select().from('category');
      query
        .leftJoin('category_description', 'des')
        .on(
          'des.category_description_category_id',
          '=',
          'category.category_id'
        );

      const currentFilters = [];
      // Parent filter
      const parentFilter = filters.find((f) => f.key === 'parent');
      if (parentFilter) {
        if (parentFilter.value === null) {
          query.andWhere('category.parent_id', 'IS NULL', null);
        } else {
          query.andWhere('category.parent_id', '=', parentFilter.value);
        }
        currentFilters.push({
          key: 'parent',
          operation: '=',
          value: parentFilter.value
        });
      }

      // Name filter
      const nameFilter = filters.find((f) => f.key === 'name');
      if (nameFilter) {
        query.andWhere('des.name', 'LIKE', `%${nameFilter.value}%`);
        currentFilters.push({
          key: 'name',
          operation: '=',
          value: nameFilter.value
        });
      }

      // Status filter
      const statusFilter = filters.find((f) => f.key === 'status');
      if (statusFilter) {
        query.andWhere('category.status', '=', statusFilter.value);
        currentFilters.push({
          key: 'status',
          operation: '=',
          value: statusFilter.value
        });
      }

      // includeInNav filter
      const includeInNav = filters.find((f) => f.key === 'includeInNav');
      if (includeInNav) {
        query.andWhere('category.include_in_nav', '=', includeInNav.value);
        currentFilters.push({
          key: 'includeInNav',
          operation: '=',
          value: includeInNav.value
        });
      }

      const sortBy = filters.find((f) => f.key === 'sortBy');
      const sortOrder = filters.find(
        (f) => f.key === 'sortOrder' && ['ASC', 'DESC'].includes(f.value)
      ) || { value: 'ASC' };
      if (sortBy && sortBy.value === 'name') {
        query.orderBy('des.name', sortOrder.value);
        currentFilters.push({
          key: 'sortBy',
          operation: '=',
          value: sortBy.value
        });
      } else {
        query.orderBy('category.category_id', 'DESC');
      }
      if (sortOrder.key) {
        currentFilters.push({
          key: 'sortOrder',
          operation: '=',
          value: sortOrder.value
        });
      }
      // Clone the main query for getting total right before doing the paging
      const cloneQuery = query.clone();
      cloneQuery.removeOrderBy();
      cloneQuery.select('COUNT(category.category_id)', 'total');
      // Paging
      const page = filters.find((f) => f.key === 'page') || { value: 1 };
      const limit = filters.find((f) => f.key === 'limit') || { value: 20 }; // TODO: Get from config
      currentFilters.push({
        key: 'page',
        operation: '=',
        value: page.value
      });
      currentFilters.push({
        key: 'limit',
        operation: '=',
        value: limit.value
      });
      query.limit(
        (page.value - 1) * parseInt(limit.value, 10),
        parseInt(limit.value, 10)
      );
      return {
        items: (await query.execute(pool)).map((row) => camelCase(row)),
        total: (await cloneQuery.load(pool)).total,
        currentFilters
      };
    },
    products: async (_, { filters = [] }, { user }) => {
      const query = select().from('product');
      query
        .innerJoin('product_inventory')
        .on(
          'product_inventory.product_inventory_product_id',
          '=',
          'product.product_id'
        );
      query
        .leftJoin('product_description', 'des')
        .on('product.product_id', '=', 'des.product_description_product_id');
      if (!user) {
        query.andWhere('product.status', '=', 1);
        if (getConfig('catalog.showOutOfStockProduct', false) === false) {
          query
            .andWhere('product_inventory.manage_stock', '=', false)
            .addNode(
              node('OR')
                .addLeaf('AND', 'product_inventory.qty', '>', 0)
                .addLeaf(
                  'AND',
                  'product_inventory.stock_availability',
                  '=',
                  true
                )
            );
        }
      }
      const currentFilters = [];
      // Price filter
      const priceFilter = filters.find((f) => f.key === 'price');
      if (priceFilter) {
        const [min, max] = priceFilter.value
          .split('-')
          .map((v) => parseFloat(v));
        let currentPriceFilter;
        if (Number.isNaN(min) === false) {
          query.andWhere('product.price', '>=', min);
          currentPriceFilter = {
            key: 'price',
            operation: '=',
            value: `${min}`
          };
        }

        if (Number.isNaN(max) === false) {
          query.andWhere('product.price', '<=', max);
          currentPriceFilter = {
            key: 'price',
            operation: '=',
            value: `${currentPriceFilter.value}-${max}`
          };
        }
        if (currentPriceFilter) {
          currentFilters.push(currentPriceFilter);
        }
      }

      // Qty filter
      const qtyFilter = filters.find((f) => f.key === 'qty');
      if (qtyFilter) {
        const [min, max] = qtyFilter.value.split('-').map((v) => parseFloat(v));
        let currentQtyFilter;
        if (Number.isNaN(min) === false) {
          query.andWhere('product_inventory.qty', '>=', min);
          currentQtyFilter = { key: 'qty', operation: '=', value: `${min}` };
        }

        if (Number.isNaN(max) === false) {
          query.andWhere('product_inventory.qty', '<=', max);
          currentQtyFilter = {
            key: 'qty',
            operation: '=',
            value: `${currentQtyFilter.value}-${max}`
          };
        }
        if (currentQtyFilter) {
          currentFilters.push(currentQtyFilter);
        }
      }

      // Name filter
      const nameFilter = filters.find((f) => f.key === 'name');
      if (nameFilter) {
        query.andWhere('des.name', 'LIKE', `%${nameFilter.value}%`);
        currentFilters.push({
          key: 'name',
          operation: '=',
          value: nameFilter.value
        });
      }

      // Sku filter
      const skuFilter = filters.find((f) => f.key === 'sku');
      if (skuFilter) {
        query.andWhere('product.sku', 'LIKE', `%${skuFilter.value}%`);
        currentFilters.push({
          key: 'sku',
          operation: '=',
          value: skuFilter.value
        });
      }

      // Status filter
      const statusFilter = filters.find((f) => f.key === 'status');
      if (statusFilter) {
        query.andWhere('product.status', '=', statusFilter.value);
        currentFilters.push({
          key: 'status',
          operation: '=',
          value: statusFilter.value
        });
      }

      const sortBy = filters.find((f) => f.key === 'sortBy');
      const sortOrder = filters.find(
        (f) => f.key === 'sortOrder' && ['ASC', 'DESC'].includes(f.value)
      ) || { value: 'ASC' };
      if (sortBy && sortBy.value === 'price') {
        query.orderBy('product.price', sortOrder.value);
        currentFilters.push({
          key: 'sortBy',
          operation: '=',
          value: sortBy.value
        });
      } else if (sortBy && sortBy.value === 'name') {
        query.orderBy('des.name', sortOrder.value);
        currentFilters.push({
          key: 'sortBy',
          operation: '=',
          value: sortBy.value
        });
      } else {
        query.orderBy('product.product_id', 'DESC');
      }
      if (sortOrder.key) {
        currentFilters.push({
          key: 'sortOrder',
          operation: '=',
          value: sortOrder.value
        });
      }
      // Clone the main query for getting total right before doing the paging
      const totalQuery = query.clone();
      totalQuery.select('COUNT(product.product_id)', 'total');
      totalQuery.removeOrderBy();
      // Paging
      const page = filters.find((f) => f.key === 'page') || { value: 1 };
      const limit = filters.find((f) => f.key === 'limit') || { value: 20 }; // TODO: Get from config
      currentFilters.push({
        key: 'page',
        operation: '=',
        value: page.value
      });
      currentFilters.push({
        key: 'limit',
        operation: '=',
        value: limit.value
      });
      query.limit(
        (page.value - 1) * parseInt(limit.value, 10),
        parseInt(limit.value, 10)
      );
      const items = (await query.execute(pool)).map((row) => camelCase(row));
      const result = await totalQuery.load(pool);
      const total = result.total;
      return {
        items,
        total,
        currentFilters
      };
    }
  },
  Category: {
    products: async (category, { filters = [] }, { user }) => {
      const query = await getProductsByCategoryBaseQuery(
        category.categoryId,
        user ? false : true
      );
      const currentFilters = [];
      // Price filter
      const minPrice = filters.find((f) => f.key === 'minPrice');
      const maxPrice = filters.find((f) => f.key === 'maxPrice');
      if (minPrice && Number.isNaN(parseFloat(minPrice.value)) === false) {
        query.andWhere('product.price', '>=', minPrice.value);
        currentFilters.push({
          key: 'minPrice',
          operation: '=',
          value: minPrice.value
        });
      }
      if (maxPrice && Number.isNaN(parseFloat(maxPrice.value)) === false) {
        query.andWhere('product.price', '<=', maxPrice.value);
        currentFilters.push({
          key: 'maxPrice',
          operation: '=',
          value: maxPrice.value
        });
      }

      // Name filter
      const nameFilter = filters.find((f) => f.key === 'name');
      if (nameFilter) {
        query.andWhere(
          'product_description.name',
          'LIKE',
          `%${nameFilter.value}%`
        );
        currentFilters.push({
          key: 'name',
          operation: '=',
          value: nameFilter.value
        });
      }

      // TODO: Apply category filters
      const filterableAttributes = await select()
        .from('attribute')
        .where('type', '=', 'select')
        .and('is_filterable', '=', 1)
        .execute(pool);
      // Attribute filters
      filters.forEach((filter) => {
        const attribute = filterableAttributes.find(
          (a) => a.attribute_code === filter.key
        );
        if (!attribute) {
          return;
        }

        const values = filter.value
          .split(',')
          .map((v) => parseInt(v, 10))
          .filter((v) => Number.isNaN(v) === false);
        if (values.length > 0) {
          const alias = uniqid();
          query
            .innerJoin('product_attribute_value_index', alias)
            .on(`${alias}.product_id`, '=', 'product.product_id')
            .and(`${alias}.attribute_id`, '=', attribute.attribute_id)
            .and(`${alias}.option_id`, 'IN', values);
        }
        currentFilters.push({
          key: filter.key,
          operation: filter.operation,
          value: values.join(',')
        });
      });

      const sortBy = filters.find((f) => f.key === 'sortBy');
      const sortOrder = filters.find(
        (f) => f.key === 'sortOrder' && ['ASC', 'DESC'].includes(f.value)
      ) || { value: 'ASC' };
      if (sortBy && sortBy.value === 'price') {
        query.orderBy('product.price', sortOrder.value);
        currentFilters.push({
          key: 'sortBy',
          operation: '=',
          value: sortBy.value
        });
      } else if (sortBy && sortBy.value === 'name') {
        query.orderBy('product_description.name`', sortOrder.value);
        currentFilters.push({
          key: 'sortBy',
          operation: '=',
          value: sortBy.value
        });
      } else {
        query.orderBy('product.product_id', sortOrder.value);
      }
      if (sortOrder.key) {
        currentFilters.push({
          key: 'sortOrder',
          operation: '=',
          value: sortOrder.value
        });
      }

      if (!user) {
        // Visibility. For variant group
        const copy = query.clone();
        // Get all group that have at lease 1 item visibile
        const visibleGroups = (
          await select('variant_group_id')
            .from('variant_group')
            .where('visibility', '=', 't')
            .execute(pool)
        ).map((v) => v.variant_group_id);

        if (visibleGroups) {
          // Get all invisible variants from current query
          copy
            .select('bool_or(product.visibility)', 'sumv')
            .select('max(product.product_id)', 'product_id')
            .andWhere('product.variant_group_id', 'IN', visibleGroups);
          copy.groupBy('product.variant_group_id');
          copy.orderBy('product.variant_group_id', 'ASC');
          copy.having('bool_or(product.visibility)', '=', 'f');
          const invisibleIds = (await copy.execute(pool)).map(
            (v) => v.product_id
          );
          if (invisibleIds.length > 0) {
            const n = node('AND');
            n.addLeaf('AND', 'product.product_id', 'IN', invisibleIds).addNode(
              node('OR').addLeaf('OR', 'product.visibility', '=', 't')
            );
            query.getWhere().addNode(n);
          } else {
            query.andWhere('product.visibility', '=', 't');
          }
        } else {
          query.andWhere('product.visibility', '=', 't');
        }
      }

      // Clone the main query for getting total right before doing the paging
      const totalQuery = query.clone();
      totalQuery.select('COUNT(product.product_id)', 'total');
      totalQuery.removeOrderBy();
      // Paging
      const page = filters.find((f) => f.key === 'page') || { value: 1 };
      const limit = filters.find((f) => f.key === 'limit') || { value: 20 }; // TODO: Get from config
      currentFilters.push({
        key: 'page',
        operation: '=',
        value: page.value
      });
      currentFilters.push({
        key: 'limit',
        operation: '=',
        value: limit.value
      });
      query.limit(
        (page.value - 1) * parseInt(limit.value, 10),
        parseInt(limit.value, 10)
      );

      const items = (await query.execute(pool)).map((row) =>
        camelCase({
          ...row,
          removeFromCategoryUrl: buildUrl('removeProductFromCategory', {
            category_id: category.uuid,
            product_id: row.uuid
          })
        })
      );

      const result = await totalQuery.load(pool);
      const total = result.total;
      return {
        items,
        total,
        currentFilters
      };
    },
    availableAttributes: async (category) => {
      const results = await getFilterableAttributes(category.categoryId);
      return results;
    },
    priceRange: async (category) => {
      const query = await getProductsByCategoryBaseQuery(category.categoryId);
      query
        .select('MIN(product.price)', 'min')
        .select('MAX(product.price)', 'max');
      const result = await query.load(pool);
      return {
        min: result.min || 0,
        max: result.max || 0
      };
    },
    url: async (category, _, { pool }) => {
      // Get the url rewrite for this category
      const urlRewrite = await select()
        .from('url_rewrite')
        .where('entity_uuid', '=', category.uuid)
        .and('entity_type', '=', 'category')
        .load(pool);
      if (!urlRewrite) {
        return buildUrl('categoryView', { uuid: category.uuid });
      } else {
        return urlRewrite.request_path;
      }
    },
    editUrl: (category) => buildUrl('categoryEdit', { id: category.uuid }),
    updateApi: (category) => buildUrl('updateCategory', { id: category.uuid }),
    deleteApi: (category) => buildUrl('deleteCategory', { id: category.uuid }),
    addProductUrl: (category) =>
      buildUrl('addProductToCategory', { category_id: category.uuid }),
    image: (category) => {
      const { image } = category;
      if (!image) {
        return null;
      } else {
        return {
          path: image,
          url: `/assets${image}`
        };
      }
    },
    children: async (category) => {
      const query = select().from('category');
      query
        .leftJoin('category_description', 'des')
        .on(
          'des.category_description_category_id',
          '=',
          'category.category_id'
        );
      query.where('category.parent_id', '=', category.categoryId);
      query.orderBy('category.sort_order', 'ASC');
      const results = await query.execute(pool);
      return results.map((row) => camelCase(row));
    },
    path: async (category, _, { pool }) => {
      const query = await execute(
        pool,
        `WITH RECURSIVE category_path AS (
          SELECT category_id, parent_id, 1 AS level
          FROM category
          WHERE category_id = ${category.categoryId}
          UNION ALL
          SELECT c.category_id, c.parent_id, cp.level + 1
          FROM category c
          INNER JOIN category_path cp ON cp.parent_id = c.category_id
        )
        SELECT category_id FROM category_path ORDER BY level DESC`
      );
      const categories = query.rows;
      // Loop the categories and load the category description
      return Promise.all(
        categories.map(async (c) => {
          const query = select().from('category');
          query
            .leftJoin('category_description', 'des')
            .on(
              'des.category_description_category_id',
              '=',
              'category.category_id'
            );
          query.where('category.category_id', '=', c.category_id);
          return camelCase(await query.load(pool));
        })
      );
    },
    parent: async (category, _, { pool }) => {
      if (!category.parentId) {
        return null;
      }
      const query = select().from('category');
      query
        .leftJoin('category_description', 'des')
        .on(
          'des.category_description_category_id',
          '=',
          'category.category_id'
        );
      query.where('category.category_id', '=', category.parentId);
      return camelCase(await query.load(pool));
    }
  }
};
