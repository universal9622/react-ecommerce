import PropTypes from 'prop-types';
import React from 'react';
import { useQuery } from 'urql';
import { Card } from '@components/admin/cms/Card';
import SettingMenu from '@components/admin/setting/SettingMenu';
import Button from '@components/common/form/Button';
import { useModal } from '@components/common/modal/useModal';
import ZoneForm from '@components/admin/checkout/shippingSetting/ZoneForm';
import Spinner from '@components/common/Spinner';
import { Zones } from '@components/admin/checkout/shippingSetting/Zones';

const CountriesQuery = `
  query Country($countries: [String]) {
    countries (countries: $countries) {
      value: code
      label: name
      provinces {
        value: code
        label: name
      }
    }
  }
`;

const ZonesQuery = `
  query Zones {
    shippingZones {
      uuid
      name
      country {
        name
        code
      }
      provinces {
        name
        code
      }
      methods {
        uuid
        name
        cost
      }
      updateApi
      addMethodApi
    }
  }
`;

export default function ShippingSetting({ createShippingZoneApi }) {
  const modal = useModal();
  const [countriesQueryData] = useQuery({
    query: CountriesQuery
  });

  const [zonesQueryData, reexecuteQuery] = useQuery({
    query: ZonesQuery
  });

  if (countriesQueryData.fetching || zonesQueryData.fetching) {
    return (
      <div className="flex justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="main-content-inner">
      <div className="grid grid-cols-6 gap-x-2 grid-flow-row ">
        <div className="col-span-2">
          <SettingMenu />
        </div>
        <div className="col-span-4">
          <Card>
            <Card.Session title="Shipping">
              <div>
                Choose where you ship and how much you charge for shipping.
              </div>
            </Card.Session>
            <Zones
              zones={zonesQueryData.data.shippingZones}
              countries={countriesQueryData.data.countries}
              getZones={reexecuteQuery}
            />
            <Card.Session>
              <div className="items-center flex justify-center">
                <Button
                  title="Create new shipping zone"
                  variant="primary"
                  onAction={() => modal.openModal()}
                />
              </div>
            </Card.Session>
          </Card>
        </div>
      </div>
      {modal.state.showing && (
        <div className={modal.className} onAnimationEnd={modal.onAnimationEnd}>
          <div
            className="modal-wrapper flex self-center justify-center items-center"
            tabIndex={-1}
            role="dialog"
          >
            <div className="modal">
              <ZoneForm
                method="POST"
                saveZoneApi={createShippingZoneApi}
                countries={countriesQueryData.data.countries}
                closeModal={() => modal.closeModal()}
                getZones={reexecuteQuery}
                zone={{}}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

ShippingSetting.propTypes = {
  createShippingZoneApi: PropTypes.string.isRequired,
  setting: PropTypes.shape({
    allowedCountries: PropTypes.arrayOf(PropTypes.string),
    weightUnit: PropTypes.string
  }).isRequired
};

export const layout = {
  areaId: 'content',
  sortOrder: 10
};

export const query = `
  query Query {
    createShippingZoneApi: url(routeId: "createShippingZone")
    shippingZones {
      uuid
      name
      country {
        name
        code
      }
      provinces {
        name
        code
      }
      methods {
        uuid
        name
      }
    }
  }
`;
