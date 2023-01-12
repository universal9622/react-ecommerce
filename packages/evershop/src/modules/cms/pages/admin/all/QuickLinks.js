import React from 'react';
import Icon from '@heroicons/react/solid/esm/HomeIcon';
import NavigationItemGroup from '../../../components/admin/NavigationItemGroup';

export default function QuickLinks({ dashboard }) {
  return (
    <NavigationItemGroup
      id="quickLinks"
      name="Quick links"
      items={[
        {
          Icon,
          url: dashboard,
          title: 'Dashboard'
        }
      ]}
    />
  );
}

export const layout = {
  areaId: 'adminMenu',
  sortOrder: 10
};

export const query = `
  query Query {
    dashboard: url(routeId: "dashboard")
  }
`;
