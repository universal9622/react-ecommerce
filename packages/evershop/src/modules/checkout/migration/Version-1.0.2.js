const { execute } = require('@evershop/postgres-query-builder');

// eslint-disable-next-line no-multi-assign
module.exports = exports = async (connection) => {
  // Reduce product stock when order is placed if product manage stock is true
  await execute(
    connection,
    `CREATE OR REPLACE FUNCTION reduce_product_stock_when_order_placed()
        RETURNS TRIGGER 
        LANGUAGE PLPGSQL
        AS
      $$
      BEGIN
        UPDATE product_inventory SET qty = qty - NEW.qty WHERE product_id = NEW.product_id AND manage_stock = TRUE;
        RETURN NEW;
      END
      $$;`
  );

  // Remove the trigger if it exists
  await execute(
    connection,
    `DROP TRIGGER IF EXISTS "TRIGGER_AFTER_INSERT_ORDER_ITEM" ON "order_item"`
  );

  await execute(
    connection,
    `CREATE TRIGGER "TRIGGER_AFTER_INSERT_ORDER_ITEM" AFTER INSERT ON "order_item" FOR EACH ROW
    EXECUTE PROCEDURE reduce_product_stock_when_order_placed();
    `
  );
};
