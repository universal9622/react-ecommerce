const fs = require('fs');
const { mkdir, writeFile } = require('fs').promises;
const path = require('path');
const { inspect } = require('util');
const { Componee } = require('../../src/lib/componee/Componee');
const { getComponentsByRoute } = require('../../src/lib/componee/getComponentsByRoute');
const { CONSTANTS } = require('../../src/lib/helpers');
const { getRouteBuildPath } = require('../../src/lib/webpack/getRouteBuildPath');
const { parseGraphql } = require('../../src/lib/webpack/util/parseGraphql');
const JSON5 = require('json5');
/**
 * Only pass the page routes, not api routes
*/
module.exports.buildEntry = async function buildEntry(routes, clientOnly = false) {
  await Promise.all(routes.map(async (route) => {
    const subPath = getRouteBuildPath(route);
    const components = getComponentsByRoute(route);
    if (!components) {
      return;
    }
    /** Build layout and query */
    const areas = {};
    components.forEach((module) => {
      if (!fs.existsSync(module)) {
        return;
      }
      const source = fs.readFileSync(module, 'utf8');
      // Regex matching 'export const layout = { ... }'
      const layoutRegex = /export\s+const\s+layout\s*=\s*{\s*areaId\s*:\s*['"]([^'"]+)['"],\s*sortOrder\s*:\s*(\d+)\s*,*\s*}/;
      const match = source.match(layoutRegex);
      if (match) {
        // Remove everything before '{' from the beginning of the match
        const check = match[0].replace(/^[^{]*/, '').replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2": ');
        try {
          const layout = JSON5.parse(check);
          const id = Buffer.from(module.replace(CONSTANTS.ROOTPATH, '')).toString('base64');
          areas[layout.areaId] = areas[layout.areaId] || {};
          areas[layout.areaId][id] = {
            id: id,
            sortOrder: layout.sortOrder,
            component: `---require('${module}')---`,
          };
        } catch (e) {
          console.log(`Error parsing layout from ${module}`);
          console.log(e);
        }
      }
    });

    let contentClient = `
      import React from 'react';
      import ReactDOM from 'react-dom';
      import Area from '@evershop/core/src/lib/components/Area';
      import Hydrate from '@evershop/core/src/lib/components/react/client/Hydrate';
      `;
    contentClient += '\r\n';
    contentClient += `Area.defaultProps.components = ${inspect(areas, { depth: 5 }).replace(/"---/g, '').replace(/---"/g, '')} `;
    contentClient += '\r\n';
    contentClient += `ReactDOM.hydrate(
        <Hydrate/>,
        document.getElementById('app')
      );`
    await mkdir(path.resolve(subPath, 'client'), { recursive: true });
    await writeFile(path.resolve(subPath, 'client', 'entry.js'), contentClient);

    if (!clientOnly) {
      /** Build query*/
      const query = `${JSON.stringify(parseGraphql(components))}`

      let contentServer = `import React from 'react'; `;
      contentServer += '\r\n';
      contentServer += `import ReactDOM from 'react-dom'; `;
      contentServer += '\r\n';
      contentServer += `import Area from "@evershop/core/src/lib/components/Area";`;
      contentServer += '\r\n';
      contentServer += `Area.defaultProps.components = ${inspect(areas, { depth: 5 }).replace(/"---/g, '').replace(/---"/g, '')} `;

      await mkdir(path.resolve(subPath, 'server'), { recursive: true });
      await writeFile(path.resolve(subPath, 'server', 'entry.js'), contentServer);
      await writeFile(path.resolve(subPath, 'server', 'query.graphql'), query);
    }
  }));
}