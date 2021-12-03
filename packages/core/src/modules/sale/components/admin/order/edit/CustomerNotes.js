import React from "react";
import Area from "../../../../../../lib/components/Area";
import { useAppState } from "../../../../../../lib/context/app";
import { get } from "../../../../../../lib/util/get";
import { Card } from "../../../../../cms/components/admin/Card";

export default function CustomerNotes(props) {
    let order = get(useAppState(), "order", {});
    return <Card title="Customer notes">
        <Card.Session>
            <Area
                id="orderEditCustomerNotes"
                coreComponents={[
                    {
                        component: {
                            default: () => <div>{order.shipping_note || <span className='text-border'>No notes from customer</span>}</div>
                        },
                        props: {
                        },
                        sortOrder: 10,
                        id: "title"
                    }
                ]}
                noOuter={true}
            />
        </Card.Session>
    </Card>
}