const { getComponentSource } = require("../../../../../lib/util")

module.exports = function (request, response) {
    response.addComponent("layout", 'body', getComponentSource("cms/components/site/layout.js", true), {}, 1);
}