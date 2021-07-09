const { select } = require('@nodejscart/mysql-query-builder')
const { pool } = require('../../../../../lib/mysql/connection');
const { buildAdminUrl } = require('../../../../../lib/routie');
const { assign } = require("../../../../../lib/util/assign");
const config = require("config");

module.exports = async (request, response, stack, next) => {
    let query = select();
    query.from("payment_transaction");
    query.where("payment_transaction_order_id", "=", request.params.id);
    let transactions = await query.execute(pool);
    assign(response.context, { order: { paymentTransactions: JSON.parse(JSON.stringify(transactions)) } });
    next();
}