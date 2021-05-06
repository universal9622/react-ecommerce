const { select } = require('../../../../../lib/mysql/query');
import { pool } from '../../../../../lib/mysql/connection';
const { assign } = require("../../../../../lib/util/assign");
const uniqid = require("uniqid");
const { buildAdminUrl } = require("../../../../../lib/routie");

module.exports = async (request, response) => {
  let images = await select("image")
    .from("product_image")
    .where("product_image_product_id", "=", request.params.id)
    .execute(pool);

  images = images.map((i) => { return { path: i.image, url: buildAdminUrl("adminStaticAsset", [i.image]), id: uniqid() } });

  let mainImage = await select("image")
    .from("product")
    .where("product_id", "=", request.params.id)
    .load(pool);

  if (mainImage["image"])
    images.unshift({ url: buildAdminUrl("adminStaticAsset", [mainImage["image"]]), path: mainImage["image"], id: uniqid() });

  assign(response.context, { product: { images: images } });
};