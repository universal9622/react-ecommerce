const { getComponentSource } = require("../../../../../lib/helpers")

module.exports = function (request, response) {
    response.addComponent("layout", 'body', getComponentSource("cms/components/admin/layout.js", true), {}, 1);
}