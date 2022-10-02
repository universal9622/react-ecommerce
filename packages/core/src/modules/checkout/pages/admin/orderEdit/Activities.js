/* eslint-disable react/no-array-index-key */
import React from 'react';
import { DateTime } from 'luxon';
import './Activities.scss';

export default function Activities({ order: { activities = [] } }) {
  const dailyActivities = [];
  activities.forEach((element) => {
    const current = dailyActivities[dailyActivities.length - 1];
    if (!current) {
      dailyActivities.push({
        time: element.createdAt.value,
        date: element.createdAt.date,
        activities: [
          {
            comment: element.comment,
            customerNotified: element.customerNotified,
            time: element.createdAt.time
          }
        ]
      });
    } else if (DateTime.fromSQL(element.createdAt.value).startOf("day") === DateTime.fromSQL(current.time).startOf("day")) {
      current.activities.push(
        {
          comment: element.comment,
          customerNotified: element.customerNotified,
          time: element.createdAt.time
        }
      );
    } else {
      dailyActivities.push({
        date: element.createdAt.value,
        date: element.createdAt.date,
        activities: [
          {
            comment: element.comment,
            customerNotified: element.customerNotified,
            time: element.createdAt.time
          }
        ]
      });
    }
  });

  return (
    <div className="order-activities">
      <h3 className="title">Activities</h3>
      <ul>
        {dailyActivities.map((group, i) => (
          <li key={i} className="group">
            <span>{group.date}</span>
            <ul>
              {group.activities.map((a, k) => (
                <li key={k} className="flex items-center">
                  <span className="dot" />
                  <div className="comment">
                    <span>{a.comment}</span>
                    {parseInt(a.customerNotified, 10) === 1 && <span className="customer-notified">Customer was notified</span>}
                  </div>
                  <span className="time">{a.time}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const layout = {
  areaId: 'leftSide',
  sortOrder: 30
}

export const query = `
  query Query {
    order(id: getContextValue("orderId")) {
      activities {
        comment
        customerNotified
        createdAt {
          value
          timezone
          date: text(format: "LLL dd")
          time: text(format: "t")
        }
      }
    }
  }
`