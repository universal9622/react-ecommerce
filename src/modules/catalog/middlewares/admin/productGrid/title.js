const { getComponentSource } = require("../../../../../lib/helpers");

module.exports = (request, response) => {
    response.addComponent("title", "head", getComponentSource("title.js"), { "title": "Products" }, 1);
}