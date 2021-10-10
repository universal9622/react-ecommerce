import React from "react";
import Area from "../../../../../../lib/components/area";
import { useAppState } from "../../../../../../lib/context/app";
import { Field } from "../../../../../../lib/components/form/Field";
import { get } from "../../../../../../lib/util/get";
import { Card } from "../../../../../cms/components/admin/card";

export default function General(props) {
    const context = useAppState();
    const fields = [
        {
            component: { default: Field },
            props: { id: "url_key", name: "url_key", label: "Url key", validationRules: ["notEmpty"], type: 'text' },
            sortOrder: 0,
            id: "url_key"
        },
        {
            component: { default: Field },
            props: { id: "meta_title", name: "meta_title", label: "Meta title", type: 'text' },
            sortOrder: 10,
            id: "meta_title"
        },
        {
            component: { default: Field },
            props: {
                id: "meta_keywords",
                name: "meta_keywords",
                label: "Meta keywords",
                type: 'text'
            },
            sortOrder: 20,
            id: "meta_keywords"
        },
        {
            component: { default: Field },
            props: {
                id: "meta_description",
                name: "meta_description",
                label: "Meta description",
                options: [{ value: 0, text: "Disabled" }, { value: 1, text: "Enabled" }],
                type: 'textarea'
            },
            sortOrder: 30,
            id: "meta_description"
        }
    ].filter((f) => {
        if (get(context, `product.${f.props.name}`) !== undefined)
            f.props.value = get(context, `product.${f.props.name}`);
        return f;
    });

    return <Card
        title="Search engine optimize"
    >
        <Card.Session>
            <Area id="productEditSeo" coreComponents={fields} />
        </Card.Session>
    </Card>;
}