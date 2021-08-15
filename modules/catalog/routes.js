module.exports = function ({ registerSiteRoute, registerAdminRoute }) {
    registerAdminRoute("productNew", ["GET"], "/products/new");

    registerAdminRoute("productEdit", ["GET"], "/products/edit/:id(\\d+)");

    registerAdminRoute("variantSearch", ["GET", "POST"], "/variant/search");

    registerAdminRoute("unlinkVariant", ["POST"], "/variant/unlink");

    registerAdminRoute("productSavePost", ["POST"], "/product/save");

    registerAdminRoute("productDelete", ["POST", "GET"], "/product/delete/:id(\\d+)");

    registerAdminRoute("productBulkDelete", ["POST"], "/product/bulkDelete");

    registerAdminRoute("productBulkEnable", ["POST"], "/product/bulkEnable");

    registerAdminRoute("productBulkDisable", ["POST"], "/product/bulkDisable");

    registerAdminRoute("productGrid", ["GET"], "/products");

    registerAdminRoute("categoryGrid", ["GET"], "/categories");

    registerAdminRoute("categoryEdit", ["GET"], "/categories/edit/:id(\\d+)");

    registerAdminRoute("categorySavePost", ["POST"], "/category/save");

    // Site routes
    registerSiteRoute("categoryView", ["GET"], "/category/:url_key");

    registerSiteRoute("productView", ["GET"], "/product/:url_key");
}
