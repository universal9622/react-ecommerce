const { getComponentSource } = require("../../../../../lib/util");
import { pool } from '../../../../../lib/mysql/connection';
import { assign } from "../../../../../lib/util/assign";

module.exports = async (request, response, stack) => {
    // Add name column to the grid
    response.addComponent("productGrid", "content", getComponentSource("catalog/components/admin/product/grid/grid.js"), { "limit": 20 }, 1);

    // execute query
    let query = stack["queryInit"];

    let limit = 20;// Default limit
    // Limit
    if (/^[0-9]+$/.test(request.query["limit"]))
        limit = parseInt(request.query["limit"]);

    let page = 1;
    // pagination
    if (/^[0-9]+$/.test(request.query["page"]))
        page = parseInt(request.query["page"]);
    assign(response.context, { grid: { page, limit } });
    query.limit((page - 1) * limit, limit);

    // Order by
    let orderBy = "product.`product_id`";
    if (request.query["sort_by"])
        orderBy = request.query["sort_by"];

    let direction = "DESC";
    if (request.query["sort_order"] === "ASC")
        direction = "DESC";

    query.orderBy(orderBy, direction);
    let products = await query.execute(pool);
    assign(response.context, { grid: { products: JSON.parse(JSON.stringify(products)) } });

    query.select("COUNT(`product_id`)", "total");
    query.limit(0, 1);
    let ps = await query.execute(pool);
    assign(response.context, { grid: { total: ps[0]["total"] } });

    return products;
}