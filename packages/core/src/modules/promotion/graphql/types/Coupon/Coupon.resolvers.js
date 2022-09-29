const { select } = require("@evershop/mysql-query-builder");
const { buildUrl } = require("../../../../../lib/router/buildUrl");
const { camelCase } = require("../../../../../lib/util/camelCase");

module.exports = {
  Query: {
    coupon: async (root, { id }, { pool, tokenPayload }) => {
      const { admin } = tokenPayload;
      const query = select()
        .from('coupon');
      query.where('coupon_id', '=', id);
      // if (admin !== true) {
      //   query.where('cms_page.`status`', '=', 1);
      // }

      const coupon = await query.load(pool);
      return coupon ? camelCase(coupon) : null;
    },
    coupons: async (_, { filters = [] }, { pool }) => {
      const query = select().from('coupon');
      const currentFilters = [];

      // Attribute filters
      filters.forEach((filter) => {
        if (filter.key === 'coupon') {
          query.andWhere('coupon.`coupon`', 'LIKE', `%${filter.value}%`);
          currentFilters.push({
            key: 'coupon',
            operation: '=',
            value: filter.value
          });
        }
        if (filter.key === 'status') {
          query.andWhere('coupon.`status`', '=', filter.value);
          currentFilters.push({
            key: 'status',
            operation: '=',
            value: filter.value
          });
        }
        // Start date filter 
        const startDate = filters.find((f) => f.key === 'startDate');
        if (startDate) {
          const [min, max] = startDate.value.split('-').map((v) => parseFloat(v));
          let currentStartDateFilter;
          if (isNaN(min) === false) {
            query.andWhere('coupon.`start_date`', '>=', min);
            currentStartDateFilter = { key: 'startDate', value: `${min}` };
          }

          if (isNaN(max) === false) {
            query.andWhere('coupon.`start_date`', '<=', max);
            currentStartDateFilter = { key: 'startDate', value: `${currentStartDateFilter.value}-${max}` };
          }
          if (currentStartDateFilter) {
            currentFilters.push(currentStartDateFilter);
          }
        }
        // Start date filter 
        const endDate = filters.find((f) => f.key === 'endDate');
        if (endDate) {
          const [min, max] = endDate.value.split('-').map((v) => parseFloat(v));
          let currentEndtDateFilter;
          if (isNaN(min) === false) {
            query.andWhere('coupon.`end_date`', '>=', min);
            currentEndtDateFilter = { key: 'endDate', value: `${min}` };
          }

          if (isNaN(max) === false) {
            query.andWhere('coupon.`end_date`', '<=', max);
            currentEndtDateFilter = { key: 'endDate', value: `${currentEndtDateFilter.value}-${max}` };
          }
          if (currentEndtDateFilter) {
            currentFilters.push(currentEndtDateFilter);
          }
        }

        // Used time filter 
        const usedTime = filters.find((f) => f.key === 'usedTime');
        if (usedTime) {
          const [min, max] = usedTime.value.split('-').map((v) => parseFloat(v));
          let currentUsedTimeFilter;
          if (isNaN(min) === false) {
            query.andWhere('coupon.`used_time`', '>=', min);
            currentUsedTimeFilter = { key: 'usedTime', value: `${min}` };
          }

          if (isNaN(max) === false) {
            query.andWhere('coupon.`used_time`', '<=', max);
            currentUsedTimeFilter = { key: 'usedTime', value: `${currentUsedTimeFilter.value}-${max}` };
          }
          if (currentUsedTimeFilter) {
            currentFilters.push(currentUsedTimeFilter);
          }
        }
      })

      const sortBy = filters.find((f) => f.key === 'sortBy');
      const sortOrder = filters.find((f) => f.key === 'sortOrder' && ['ASC', 'DESC'].includes(f.value)) || { value: 'ASC' };
      if (sortBy && sortBy.value === 'name') {
        query.orderBy('cms_page_description.`name`', sortOrder.value);
        currentFilters.push({
          key: 'sortBy',
          operation: '=',
          value: sortBy.value
        });
      } else {
        query.orderBy('cms_page.`cms_page_id`', "DESC");
      };

      if (sortOrder.key) {
        currentFilters.push({
          key: 'sortOrder',
          operation: '=',
          value: sortOrder.value
        });
      }
      // Clone the main query for getting total right before doing the paging
      const cloneQuery = query.clone();
      cloneQuery.select('COUNT(cms_page.`cms_page_id`)', 'total');
      // Paging
      const page = filters.find((f) => f.key === 'page') || { value: 1 };
      const limit = filters.find((f) => f.key === 'limit') || { value: 20 };// TODO: Get from config
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
      query.limit((page.value - 1) * parseInt(limit.value), parseInt(limit.value));
      return {
        items: (await query.execute(pool)).map(row => camelCase(row)),
        total: (await cloneQuery.load(pool))['total'],
        currentFilters: currentFilters,
      }
    }
  },
  CmsPage: {
    url: ({ urlKey }) => buildUrl('cmsPageView', { url_key: urlKey }),
    editUrl: ({ cmsPageId }) => buildUrl('cmsPageEdit', { id: cmsPageId })
  }
}