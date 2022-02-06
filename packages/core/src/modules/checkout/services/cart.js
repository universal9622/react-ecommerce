const isEqualWith = require('lodash/isEqualWith');
const Topo = require('@hapi/topo');
const config = require('config');
const { select, del } = require('@nodejscart/mysql-query-builder');
const fs = require('fs');
const path = require('path');
const { pool } = require('../../../lib/mysql/connection');
const { CONSTANTS } = require('../../../lib/helpers');
const { buildUrl } = require('../../../lib/router/buildUrl');

class DataObject {
  constructor() {
    this._dataSource = [];
    this._resolvers = [];
    this._building = false;
    this._error = undefined;
  }

  _prepareFields(fields) {
    const _fields = fields.filter((f, index, fields) => {
      if (!f.dependencies) return true;
      const { dependencies } = f;
      let flag = true;
      // Field will be removed if it's dependency missing
      dependencies.forEach((d) => {
        if (flag == false || fields.findIndex((m) => m.key === d) === -1) {
          flag = false;
        }
      });

      return flag;
    });

    const sorter = new Topo.Sorter();
    _fields.forEach((f) => {
      sorter.add(f.key, { before: [], after: f.dependencies, group: f.key });
    });

    this._fields = sorter.nodes.map((n) => {
      const index = _fields.findIndex((f) => f.key === n);
      const f = _fields[index];
      if (this._resolvers.findIndex((r) => r.key === f.key) === -1) {
        this._resolvers.push({
          key: f.key,
          resolver: f.resolver
        });
      }

      _fields.splice(index, 1);

      return { ...f };
    });
  }

  async build() {
    this._building = true;
    for (let i = 0; i < this._resolvers.length; i++) {
      const field = this._fields.find((f) => f.key === this._resolvers[i].key);
      field.value = await this._resolvers[i].resolver.call(this);
    }
    this._building = false;
  }

  getData(key) {
    const field = this._fields.find((f) => f.key === key);
    if (field === undefined) { throw new Error(`Field ${key} not existed`); }

    return field.value ?? null;
  }

  async setData(key, value) {
    if (this._building === true) { throw new Error('Can not set value when object is building'); }

    const field = this._fields.find((f) => f.key === key);
    if (field === undefined) { throw new Error(`Field ${key} not existed`); }
    this._dataSource[key] = value;
    await this.build();
    if (!isEqualWith(this.getData(key), value)) { throw new Error(`Field resolver returned different value - ${key}`); } else return value;
  }

  export() {
    const data = {};
    this._fields.forEach((f) => {
      data[f.key] = f.value;
    });

    return data;
  }
}

class Item extends DataObject {
  static fields = [
    {
      key: 'cart_item_id',
      async resolver() {
        return this._dataSource.cart_item_id ?? null;
      }
    },
    {
      key: 'product_id',
      async resolver() {
        const query = select()
          .from('product');
        query.leftJoin('product_description', 'des')
          .on('product.`product_id`', '=', 'des.`product_description_product_id`');
        const product = await query.where('product_id', '=', this._dataSource.product_id)
          .load(pool);
        if (!product || product.status === 0) {
          this._error = 'Requested product does not exist';
          this._dataSource = { ...this._dataSource, product: {} };
          return null;
        }
        this._dataSource = { ...this._dataSource, product };
        return this._dataSource.product_id;
      }
    },
    {
      key: 'product_sku',
      async resolver() {
        return this._dataSource.product.sku ?? null;
      },
      dependencies: ['product_id']
    },
    {
      key: 'product_name',
      async resolver() {
        return this._dataSource.product.name ?? null;
      },
      dependencies: ['product_id']
    },
    {
      key: 'thumbnail',
      async resolver() {
        if (this._dataSource.product.image) {
          const thumb = this._dataSource.product.image.replace(/.([^.]*)$/, '-thumb.$1');
          return fs.existsSync(path.join(CONSTANTS.MEDIAPATH, thumb)) ? `/assets${thumb}` : `/assets/theme/site${config.get('catalog.product.image.placeHolder')}`;
        } else {
          return `/assets/theme/site${config.get('catalog.product.image.placeHolder')}`;
        }
      },
      dependencies: ['product_id']
    },
    {
      key: 'product_weight',
      async resolver() {
        return parseFloat(this._dataSource.product.weight) ?? null;
      },
      dependencies: ['product_id']
    },
    {
      key: 'product_price',
      async resolver() {
        return parseFloat(this._dataSource.product.price) ?? null;
      },
      dependencies: ['product_id']
    },
    {
      key: 'product_price_incl_tax',
      async resolver() {
        return parseFloat(this.getData('product_price')) ?? null;
      },
      dependencies: ['product_price']
    },
    {
      key: 'qty',
      async resolver() {
        if (
          this._dataSource.product.product_id
          && this._dataSource.product.manage_stock === 1
          && this._dataSource.product.qty < 1
        ) this._error = 'This item is out of stock';
        else if (
          this._dataSource.product.product_id
          && this._dataSource.product.manage_stock === 1
          && this._dataSource.product.qty < this._dataSource.qty
        ) this._error = 'We do not have enough stock';

        return parseInt(this._dataSource.qty) ?? null;
      },
      dependencies: ['product_id']
    },
    {
      key: 'final_price',
      async resolver() {
        return parseFloat(this.getData('product_price')) ?? null;
      },
      dependencies: ['product_price']
    },
    {
      key: 'final_price_incl_tax',
      async resolver() {
        return parseFloat(this._dataSource.product.price) ?? null;
      },
      dependencies: ['final_price']
    },
    {
      key: 'total',
      async resolver() {
        return this.getData('final_price') * this.getData('qty') + this.getData('tax_amount') ?? null;
      },
      dependencies: ['final_price', 'qty', 'tax_amount']
    },
    {
      key: 'tax_percent',
      async resolver() {
        return 0; // Will be added later
      }
    },
    {
      key: 'tax_amount',
      async resolver() {
        return 0; // Will be added later
      },
      dependencies: []
    },
    {
      key: 'discount_amount',
      async resolver() {
        return 0; // Will be added later
      },
      dependencies: ['final_price']
    },
    {
      key: 'variant_group_id',
      async resolver() {
        return this._dataSource.product.variant_group_id ?? null;
      },
      dependencies: ['product_id']
    },
    {
      key: 'variant_options',
      async resolver() {
        if (this._dataSource.product.variant_group_id) {
          const group = await select('attribute_one')
            .select('attribute_two')
            .select('attribute_three')
            .select('attribute_four')
            .select('attribute_five')
            .from('variant_group')
            .where('variant_group_id', '=', this._dataSource.product.variant_group_id)
            .load(pool);
          if (!group) return null;
          else {
            const query = select('a.`attribute_code`')
              .select('a.`attribute_name`')
              .select('a.`attribute_id`')
              .select('o.`option_id`')
              .select('o.`option_text`')
              .from('attribute', 'a');
            query.innerJoin('product_attribute_value_index', 'o').on('a.`attribute_id`', '=', 'o.`attribute_id`');
            query.where('o.`product_id`', '=', this._dataSource.product.product_id)
              .and('a.`attribute_id`', 'IN', Object.values(group).filter((v) => v != null));

            return JSON.stringify(await query.execute(pool));
          }
        } else {
          return null;
        }
      },
      dependencies: ['variant_group_id']
    },
    {
      key: 'product_custom_options',
      async resolver() {
        return null; // Will be added later
      },
      dependencies: ['product_id']
    },
    {
      key: 'productUrl',
      async resolver() {
        return this.getData('product_id') ? buildUrl('productView', { url_key: this._dataSource.product.url_key }) : null;
      },
      dependencies: ['product_id']
    },
    {
      key: 'removeUrl',
      async resolver() {
        if (this.getData('cart_item_id')) return buildUrl('cartItemRemove', { id: this.getData('cart_item_id') });
      },
      dependencies: ['cart_item_id']
    }
  ];

  constructor(data = {}) {
    super();
    this._dataSource = data;

    this._prepareFields(Item.fields);
    this._error = undefined;

    return this;
  }
}

module.exports = exports = {};

exports.Cart = class Cart extends DataObject {
  static fields = [
    {
      key: 'cart_id',
      async resolver() {
        if (this._dataSource.cart_id) {
          const cart = await select()
            .from('cart')
            .where('cart_id', '=', this._dataSource.cart_id)
            .load(pool);
          if (!cart || cart.status == 0) {
            this._error = 'Cart does not exist';
            this._dataSource = {};
            return null;
          } else {
            return cart.cart_id;
          }
        }
      }
    },
    {
      key: 'currency',
      async resolver() {
        return config.get('shop.currency');
      }
    },
    {
      key: 'user_ip',
      async resolver() {
        return this._request.ip;
      }
    },
    {
      key: 'customer_email',
      async resolver() {
        return this._dataSource.customer_email ?? this.getData('customer_email') ?? null;
      }
    },
    {
      key: 'customer_full_name',
      async resolver() {
        return this._dataSource.customer_full_name ?? this.getData('customer_full_name') ?? null;
      }
    },
    {
      key: 'status',
      async resolver() {
        return this._dataSource.status ?? this.getData('status') ?? 1;
      }
    },
    {
      key: 'total_qty',
      async resolver() {
        let count = 0;
        const items = this.getItems();
        items.forEach((i) => {
          count += parseInt(i.getData('qty'));
        });

        return count;
      },
      dependencies: ['items']
    },
    {
      key: 'total_weight',
      async resolver() {
        let weight = 0;
        const items = this.getItems();
        items.forEach((i) => {
          weight += i.getData('product_weight') * i.getData('qty');
        });

        return weight;
      },
      dependencies: ['items']
    },
    {
      key: 'tax_amount',
      async resolver() {
        return 0; // Will be added later
      },
      dependencies: []
    },
    {
      key: 'discount_amount',
      async resolver() {
        return 0; // Will be added later
      },
      dependencies: []
    },
    {
      key: 'sub_total',
      async resolver() {
        let total = 0;
        const items = this.getItems();
        items.forEach((i) => {
          total += i.getData('final_price') * i.getData('qty');
        });

        return total;
      },
      dependencies: ['items']
    },
    {
      key: 'grand_total',
      async resolver() {
        return this.getData('sub_total');
      },
      dependencies: ['sub_total']
    },
    {
      key: 'shipping_address_id',
      async resolver() {
        return this._dataSource.shipping_address_id;
      },
      dependencies: ['cart_id']
    },
    {
      key: 'shippingAddress',
      async resolver() {
        if (!this.getData('shipping_address_id')) {
          return undefined;
        } else {
          return { ...await select().from('cart_address').where('cart_address_id', '=', this.getData('shipping_address_id')).load(pool) };
        }
      },
      dependencies: ['shipping_address_id']
    },
    {
      key: 'shipping_method',
      async resolver() {
        return this._dataSource.shipping_method;// TODO: This field should be handled by each of shipping method
      },
      dependencies: ['shipping_address_id']
    },
    {
      key: 'shipping_method_name',
      async resolver() {
        return this._dataSource.shipping_method_name;// TODO: This field should be handled by each of shipping method
      },
      dependencies: ['shipping_method']
    },
    {
      key: 'shipping_fee_excl_tax',
      async resolver() {
        return 0;// TODO: This field should be handled by each of shipping method
      },
      dependencies: ['shipping_method']
    },
    {
      key: 'shipping_fee_incl_tax',
      async resolver() {
        return 0;// TODO: This field should be handled by each of shipping method
      },
      dependencies: ['shipping_method']
    },
    {
      key: 'billing_address_id',
      async resolver() {
        return this._dataSource.billing_address_id;
      },
      dependencies: ['cart_id']
    },
    {
      key: 'billingAddress',
      async resolver() {
        if (!this.getData('billing_address_id')) {
          return undefined;
        } else {
          return { ...await select().from('cart_address').where('cart_address_id', '=', this.getData('billing_address_id')).load(pool) };
        }
      },
      dependencies: ['billing_address_id']
    },
    {
      key: 'payment_method',
      async resolver() {
        return this._dataSource.payment_method;// TODO: This field should be handled by each of payment method
      }
    },
    {
      key: 'payment_method_name',
      async resolver() {
        return this._dataSource.payment_method_name;// TODO: This field should be handled by each of payment method
      },
      dependencies: ['payment_method']
    },
    {
      key: 'items',
      async resolver() {
        const items = [];
        if (this._dataSource.items) {
          this._dataSource.items.forEach((item) => {
            // If this is just new added item, add it to the list
            if (item.getData('cart_item_id') === null && item._error === undefined) {
              items.push(item);
            } else if (item.getData('cart_item_id') !== null) {
              // If the item is not build
              if (item._dataSource.product === undefined) item.build();
              items.push(item);
            }
          });
        } else {
          const query = select();
          const list = await query.from('cart_item')
            .where('cart_id', '=', this.getData('cart_id'))
            .execute(pool);

          await Promise.all(list.map(async (i) => {
            const item = new Item(i);
            await item.build();
            if (!item.getData('product_id')) {
              await del('cart_item')
                .where('cart_item_id', '=', i.cart_item_id)
                .execute(pool);
              return;
            }
            let flag = true;
            items.forEach((_item) => {
              if (_item.getData('product_sku') == item.getData('product_sku') && isEqualWith(_item.getData('product_custom_options'), item.getData('product_custom_options'))) {
                _item.setData('qty', _item.getData('qty') + item.getData('qty'));
                flag = false;
              }
            });
            if (flag === false) {
              await del('cart_item')
                .where('cart_item_id', '=', i.cart_item_id)
                .execute(pool);
            } else items.push(item);
          }));
          this._dataSource.items = items;
        }

        return items;
      },
      dependencies: ['cart_id']
    }
  ];

  constructor(request, data = {}) {
    super();
    this._dataSource = data;
    this._request = request;
    this._prepareFields(Cart.fields);

    return this;
  }

  getItems() {
    return this.getData('items') ?? [];
  }

  async addItem(data) {
    const item = new Item(data);
    await item.build();
    if (item._error) { throw new Error(item._error); } else {
      let items = this.getItems();
      let flag = false;
      for (let i = 0; i < items.length; i++) {
        if (items[i].getData('product_sku') === item.getData('product_sku') && isEqualWith(items[i].getData('product_custom_options'), item.getData('product_custom_options'))) {
          await items[i].setData('qty', item.getData('qty') + items[i].getData('qty'));
          if (item._error) { throw new Error(item._error); }
          flag = true;
        }
      }

      if (flag === false) {
        items = items.concat(item);
      }
      await this.setData('items', items);

      return item;
    }
  }

  hasError() {
    const items = this.getItems();
    let flag = false;
    for (let i = 0; i < items.length; i++) {
      if (items[i]._error) {
        flag = true;
        break;
      }
    }

    return flag;
  }
};
