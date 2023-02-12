import PropTypes from 'prop-types';
import React from 'react';
import { toast } from 'react-toastify';
import './AdminUser.scss';

export default function AdminUser({ adminUser, logoutUrl, loginPage }) {
  const [showLogout, setShowLogout] = React.useState(false);

  const show = (e) => {
    e.preventDefault();
    setShowLogout(!showLogout);
  };

  const logout = async () => {
    const response = await fetch(logoutUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (response.status === 200) {
      window.location.href = loginPage;
    } else {
      toast.error('Logout failed');
    }
  };

  if (!adminUser) {
    return null;
  }
  const { fullName } = adminUser;
  return (
    <div className="admin-user flex flex-grow justify-end items-center">
      <div className="flex justify-items-start gap-1 justify-center">
        <div className="relative">
          <a className="first-letter" href="#" onClick={(e) => show(e)}>
            {fullName[0]}
          </a>
          {showLogout && (
            <div className="logout bg-background shadow p-2">
              <div>
                <div>
                  Hello <span className="text-primary">{fullName}!</span>
                </div>
                <div className="mt-1">
                  <a
                    className="text-critical"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      logout();
                    }}
                  >
                    Logout
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

AdminUser.propTypes = {
  adminUser: PropTypes.shape({
    email: PropTypes.string.isRequired,
    fullName: PropTypes.string.isRequired
  }).isRequired,
  loginPage: PropTypes.string.isRequired,
  logoutUrl: PropTypes.string.isRequired
};

export const layout = {
  areaId: 'header',
  sortOrder: 50
};

export const query = `
  query Query {
    adminUser(id: getContextValue("userId", null)) {
      adminUserId
      fullName
      email
    },
    logoutUrl: url(routeId: "deleteAdminUserSession", params: [{ key: "id", value: getContextValue('sid') }]),
    loginPage: url(routeId: "adminLogin")
  }
`;
