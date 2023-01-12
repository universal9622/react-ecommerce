import React from 'react';
import { inspect } from 'util';
import { renderToString } from 'react-dom/server';
import ServerHtml from './Server';
import { AppProvider } from '../../../context/app';

export function renderHtml(js, css, contextData) {
  const source = renderToString(
    <AppProvider value={contextData}>
      <ServerHtml
        js={js}
        css={css}
        appContext={`var eContext = ${inspect(contextData, { depth: 10, maxArrayLength: null })}`}
      />
    </AppProvider>
  );

  return `<!DOCTYPE html><html id="root">${source}</html>`;
}
