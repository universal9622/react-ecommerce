const { assign } = require('./util/assign');
const { getSiteRoutes, getAdminRoutes, getRoutes } = require('./routie');

module.exports = exports = {};

var components = {
    site: {},
    admin: {}
};

function addComponent(scope, route, id, areaId, source, props, sortOrder) {
    // TODO: validate the arguments, for now let's assume they are valid
    let data = {
        [scope]: {
            [route]: {
                [areaId]: {
                    [id]: {
                        id,
                        source,
                        props,
                        sortOrder
                    }
                }
            }
        }
    };
    assign(components, data);
}

exports.addComponents = function addComponents(scope, components) {
    let routes = scope === "admin" ? getAdminRoutes() : getSiteRoutes();
    for (let key in components) {
        if (!Array.isArray(components[key])) {
            throw new TypeError(`Component list under ${key} must be an array.`)
        }
        if (key === "*") {
            routes.forEach(route => {
                if (route.method.length === 1 && route.method[0] === "GET") {
                    components[key].forEach(c => {
                        addComponent(scope, route.id, c.id, c.areaId, c.source, c.props, c.sortOrder);
                    })
                }
            })
        } else if (/^\*-([a-zA-Z,])+/g.test(key)) {
            let excepts = key.split("-")[1].split(",");
            routes.forEach(route => {
                if (route.method.length === 1 && route.method[0] === "GET" && !excepts.includes(route.id)) {
                    components[key].forEach(c => {
                        addComponent(scope, route.id, c.id, c.areaId, c.source, c.props, c.sortOrder);
                    })
                }
            })
        } else if (/([a-zA-Z\+])/.test(key)) {
            let list = key.split("+");
            routes.forEach(route => {
                if (route.method.length === 1 && route.method[0] === "GET" && list.includes(route.id)) {
                    components[key].forEach(c => {
                        addComponent(scope, route.id, c.id, c.areaId, c.source, c.props, c.sortOrder);
                    })
                }
            })
        }
    }
    // if (routes.includes("*")) {
    //     components[currentScope]['*'] = components[currentScope]['*'] || [];
    //     components[currentScope]['*'].push({
    //         id, source, component: require(source), componentHolder: jjjjjjjjjjjjjjjjjjjjjjjjjjjjui, props, sortOrder
    //     })
    // }
    // serverComponents[areaID] = serverComponents[areaID] || {};
    // clientComponents[areaID] = clientComponents[areaID] || {};
    // let id = unique();

    // components[areaID][id] = {
    //     id, source, component: require(source), componentHolder: `---require("${source}")---`, props, sortOrder
    // }
}

exports.getComponentsByRoute = function getComponentsByRoute(routeId) {
    if (components.site[routeId])
        return components.site[routeId];
    else if (components.admin[routeId])
        return components.admin[routeId];
    else
        return null;
}

exports.getAll = function getAll() {
    return components;
}