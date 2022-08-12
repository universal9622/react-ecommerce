module.exports = exports = {};

class Router {
  constructor() {
    this.routes = [];
  }

  getSiteRoutes() {
    return this.routes.filter((r) => r.isAdmin === false)
  };

  getAdminRoutes() {
    return this.routes.filter((r) => r.isAdmin === true)
  };

  getRoutes() {
    return this.routes;
  }

  addRoute(route) {
    let r = this.routes.find((r) => r.id === route.id);
    if (r !== undefined) {
      Object.assign(r, route);
    } else {
      this.routes.push(route);
    }
  }

  empty() {
    this.routes = [];
  }
}

const router = new Router();
exports.addRoute = (route) => router.addRoute(route);
exports.getSiteRoutes = () => router.getSiteRoutes();
exports.getAdminRoutes = () => router.getAdminRoutes();
exports.getRoutes = () => router.getRoutes();
exports.empty = () => router.empty();
