import React from 'react';
import ReactDOM from 'react-dom';
import Area from '@evershop/evershop/src/lib/components/Area';
import { App } from '@evershop/evershop/src/lib/components/react/client/Client';
import { HotReload } from '@evershop/evershop/src/lib/components/react/client/HotReload';

const hot = require('webpack-hot-middleware/client?path=/eHot&reload=true&overlay=true');
/** render */
ReactDOM.render(<App><HotReload hot={hot} /></App>, document.getElementById('app'));
if (module.hot) {
  module.hot.accept();
}
