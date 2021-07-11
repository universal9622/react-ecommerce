const { buildAdminUrl } = require("../../../../../lib/routie");
const { assign } = require("../../../../../lib/util/assign");

module.exports = (request, response) => {
    // Add uploadUrl to app context
    assign(response.context, { pageImageUploadUrl: buildAdminUrl("imageUpload", [""]) })
};