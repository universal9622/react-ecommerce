import PropTypes from 'prop-types';
import { XAxis, YAxis, Tooltip, AreaChart, Area } from 'recharts';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Card } from '../../../../cms/components/admin/Card';
import './Statistic.scss';

export default function SaleStatistic({ api }) {
  const [data, setData] = useState([]);
  const [period, setPeriod] = useState('monthly');
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (window !== undefined) {
      fetch(`${api}?period=${period}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then((response) => response.json())
        .then((json) => {
          setData(json);
          setFetching(false);
        })
        .catch((error) => {
          toast.error(error.message);
        });
    }
  }, [period]);

  if (fetching) {
    return (
      <Card title="Sale Statistic">
        <div className="skeleton-wrapper-statistic">
          <div className="skeleton" />
        </div>
      </Card>
    );
  } else {
    return (
      <Card
        title="Sale Statistic"
        actions={[
          {
            name: 'Daily',
            onAction: () => setPeriod('daily')
          },
          {
            name: 'Weekly',
            onAction: () => setPeriod('weekly')
          },
          {
            name: 'Monthly',
            onAction: () => setPeriod('monthly')
          }
        ]}
      >
        <Card.Session>
          {data.length === 0 ? null : (
            <AreaChart
              width={580}
              height={300}
              data={data}
              margin={{
                top: 5,
                right: 0,
                left: -25,
                bottom: 5
              }}
              id="asdasd"
            >
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="value"
                stackId="1"
                stroke="#8884d8"
                fill="#8884d8"
              />
              <Area
                type="monotone"
                dataKey="count"
                stackId="1"
                stroke="#82ca9d"
                fill="#82ca9d"
              />
            </AreaChart>
          )}
        </Card.Session>
      </Card>
    );
  }
}

SaleStatistic.propTypes = {
  api: PropTypes.string.isRequired
};

export const layout = {
  areaId: 'leftSide',
  sortOrder: 10
};

export const query = `
  query Query {
    api: url(routeId: "salestatistic")    
  }
`;
