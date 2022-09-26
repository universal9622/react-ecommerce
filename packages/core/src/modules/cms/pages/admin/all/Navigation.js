import React from 'react';
import Area from '../../../../../lib/components/Area';
import './Navigation.scss';

export default function AdminNavigation() {
  return (
    <div className="admin-nav-container">
      <div className="admin-nav">
        <ul className="list-unstyled">
          <Area id="adminMenu" noOuter />
        </ul>
      </div>
    </div>
  );
}

export const layout = {
  areaId: 'adminNavigation',
  sortOrder: 10
}