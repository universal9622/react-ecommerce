const { resolve } = require('path');
const { existsSync, readdirSync } = require('fs');
const Topo = require('@hapi/topo');
const logger = require('./log/logger');

module.exports = exports = {};

var middee = {
    stack: [],
    middlewares: [
        {
            id: 'cleanStack',
            routeId: null,
            before: null,
            after: null,
            middleware: function (request, response, next) {
                let route = request._route;
                middee.stack[route.id] = [];
                logger.log('info', `REQUEST ${request.originalUrl}`);
                next();
            }
        }
    ]
};

function addMiddleware(id, middleware, routeId = null, before = null, after = null) {
    if (!/^[a-zA-Z1-9.]/g.test(id))
        throw new TypeError(`Middleware ID ${id} is invalid`);

    if (middee.middlewares.findIndex(m => m.id === id && (m.routeId === null || m.routeId === routeId)) !== -1)
        throw new Error(`Middleware id ${id} is already existed`);

    // Check if the middleware is an error handler
    if (middleware.length === 5) {
        middee.middlewares.push(
            {
                id: String(id),
                routeId: routeId,
                before: before,
                after: after,
                middleware: function (error, request, response, next) {
                    if (request._route)
                        middleware(error, request, response, middee.stack[request._route.id], next);
                    else
                        middleware(error, request, response, [], next);
                }
            }
        );
    } else {
        middee.middlewares.push(
            {
                id: String(id),
                routeId: routeId,
                before: before,
                after: after,
                middleware: function (request, response, next) {
                    logger.log('info', `Executing middleware ${id}`);
                    // If there response status is 404. We skip routed middlewares
                    if (response.statusCode === 404 && routeId !== null && routeId !== "site") {
                        return next();
                    }
                    // Workaround for default middlewares
                    if (middleware.length == 4) {
                        middee.stack[request._route.id][id] = middleware(request, response, middee.stack[request._route.id], next);
                        if (middee.stack[request._route.id][id] instanceof Promise)
                            middee.stack[request._route.id][id].catch(e => {
                                logger.log("error", `Exception in middleware ${id}`, { message: e.message, stack: e.stack })
                            })
                    }
                    else {
                        middee.stack[request._route.id][id] = middleware(request, response, middee.stack[request._route.id]);
                        if (middee.stack[request._route.id][id] instanceof Promise)
                            middee.stack[request._route.id][id].catch(e => {
                                logger.log("error", `Exception in middleware ${id}`, { message: e.message, stack: e.stack })
                            })
                        if (middee.stack[request._route.id][id] instanceof Error) {
                            next(middee.stack[request._route.id][id]);
                        } else {
                            if (middee.stack[request._route.id][id] === "STOP")
                                return;
                            else
                                next();
                        }
                    }
                }
            }
        );
    }
}

exports.getAdminMiddlewares = function getAdminMiddlewares(routeId) {
    return sortMiddlewares(middee.middlewares.filter(m => m.routeId === "admin" || m.routeId === routeId || m.routeId === null));
}

exports.getFrontMiddlewares = function getFrontMiddlewares(routeId) {
    return sortMiddlewares(middee.middlewares.filter(m => m.routeId === "front" || m.routeId === routeId || m.routeId === null));
}

function sortMiddlewares(middlewares = []) {
    let _middlewares = middlewares.filter(m => {
        if (m.before === m.after === null)
            return true;
        let dependencies = (m.before || []).concat(m.after || []);
        let flag = true;
        dependencies.forEach(d => {
            if (flag == false || middlewares.findIndex(m => m.id === d) === -1) {
                flag = false;
                return;
            }
        });

        return flag;
    });

    const sorter = new Topo.Sorter();
    _middlewares.forEach(m => {
        sorter.add(m.id, { before: m.before, after: m.after, group: m.id })
    });

    return sorter.nodes.map((n) => {
        let index = _middlewares.findIndex(m => m.id === n)
        let m = _middlewares[index];
        _middlewares.splice(index, 1);
        return m;
    });
}

exports.getModuleMiddlewares = function getModuleMiddlewares(_path) {
    if (existsSync(resolve(_path, "controllers"))) {
        // Scan for the application level middleware
        scanForMiddleware(resolve(_path, "controllers")).forEach(m => addMiddleware(m.id, m.middleware, null, m.before || null, m.after || null));

        // Scan for the admin level middleware
        if (existsSync(resolve(_path, "controllers", "admin"))) {
            loadMiddlewareFunctions(resolve(_path, "controllers", "admin"), "admin");
        }

        // Scan for the site level middleware
        if (existsSync(resolve(_path, "controllers", "site"))) {
            loadMiddlewareFunctions(resolve(_path, "controllers", "site"), "site");
        }
    }
    if (existsSync(resolve(_path, "apiControllers"))) {
        // Scan for the application level middleware
        scanForMiddleware(resolve(_path, "apiControllers")).forEach(m => addMiddleware(m.id, m.middleware, null, m.before || null, m.after || null));

        // Scan for the admin level middleware
        if (existsSync(resolve(_path, "apiControllers", "admin"))) {
            loadMiddlewareFunctions(resolve(_path, "apiControllers", "admin"), "admin");
        }

        // Scan for the site level middleware
        if (existsSync(resolve(_path, "apiControllers", "site"))) {
            loadMiddlewareFunctions(resolve(_path, "apiControllers", "site"), "site");
        }
    }
}

function loadMiddlewareFunctions(_path, scope) {
    let routes = readdirSync(_path, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    routes.forEach(r => {
        let middlewares = scanForMiddleware(resolve(_path, r));
        if (r == "all") {
            middlewares.forEach(m => addMiddleware(m.id, m.middleware, scope, m.before || null, m.after || null))
        } else {
            let split = r.split(/[+]+/);
            if (split.length == 1) {
                middlewares.forEach(m => addMiddleware(m.id, m.middleware, r, m.before || null, m.after || null))
            } else {
                split.forEach(s => {
                    let r = (s.trim());
                    if (r != "") {
                        middlewares.forEach(m => addMiddleware(m.id, m.middleware, r, m.before || null, m.after || null))
                    }
                })
            }
        }
    })
}

function scanForMiddleware(_path) {
    return readdirSync(resolve(_path), { withFileTypes: true })
        .filter(dirent => dirent.isFile() && /.js$/.test(dirent.name))
        .map(dirent => {
            let name = dirent.name;
            let m;
            if (/^(\[)[a-zA-Z1-9.,]+(\])[a-zA-Z1-9]+.js$/.test(name)) {
                let split = name.split(/[\[\]]+/);
                m = {
                    id: split[2].substr(0, split[2].indexOf('.')).trim(),
                    middleware: require(resolve(_path, dirent.name)),
                    after: split[1].split(",").filter((a) => a.trim() !== "")
                }
            } else if (/^[a-zA-Z1-9]+(\[)[a-zA-Z1-9,]+(\]).js$/.test(name)) {
                let split = name.split(/[\[\]]+/);
                m = {
                    id: split[0].trim(),
                    middleware: require(resolve(_path, dirent.name)),
                    before: split[1].split(",").filter((a) => a.trim() !== "")
                }
            } else if (/^(\[)[a-zA-Z1-9,]+(\])[a-zA-Z1-9]+(\[)[a-zA-Z1-9,]+(\]).js$/.test(name)) {
                let split = name.split(/[\[\]]+/);
                m = {
                    id: split[2].trim(),
                    middleware: require(resolve(_path, dirent.name)),
                    after: split[1].split(",").filter((a) => a.trim() !== ""),
                    before: split[3].split(",").filter((a) => a.trim() !== "")
                }
            } else {
                let split = name.split('.');
                m = {
                    id: split[0].trim(),
                    middleware: require(resolve(_path, dirent.name))
                }
            }
            if (m.id !== 'context' && m.id !== 'errorHandler') {
                m.before = !m.before ? (["notification"]) : m.before;
                m.after = !m.after ? (["session"]) : m.after;
            }

            return m;
        });
}

exports.get = function get() {
    return sortMiddlewares(middee.middlewares);
}
