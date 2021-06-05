import React from "react";
import Area from "../../../../../../lib/components/area";
import { appContext } from "../../../../../../lib/context/app";
import Text from "../../../../../../lib/components/form/fields/text";
import Switch from "../../../../../../lib/components/form/fields/switch";
import TextArea from "../../../../../../lib/components/form/fields/textarea";
import { get } from "../../../../../../lib/util/get";
import Ckeditor from "../../../../../../lib/components/form/fields/ckeditor";

export default function General(props) {
    const context = React.useContext(appContext);
    const fields = [
        {
            component: { default: Text },
            props: { id: "name", name: "name", label: "Name", validationRules: ["notEmpty"] },
            sort_order: 10,
            id: "name"
        },
        {
            component: { default: Text },
            props: {
                id: "sku",
                name: "sku",
                label: "SKU",
                validation_rules: ["notEmpty"]
            },
            sort_order: 20,
            id: "sku"
        },
        {
            component: { default: Switch },
            props: { id: "status", name: "status", label: "Status", options: [{ value: 0, text: "Disabled" }, { value: 1, text: "Enabled" }] },
            sort_order: 30,
            id: "status"
        },
        {
            component: { default: Switch },
            props: { id: "visibility", name: "visibility", label: "Visibility" },
            sort_order: 35,
            id: "visibility"
        },
        {
            component: { default: Text },
            props: { id: "weight", name: "weight", type: "text", label: "Weight", validationRules: ["notEmpty", "decimal"] },
            sort_order: 40,
            id: "weight"
        },
        {
            component: { default: Text },
            props: {
                id: "price",
                name: "price",
                label: "Price",
                validation_rules: ["notEmpty"]
            },
            sort_order: 50,
            id: "price"
        },
        {
            component: { default: Ckeditor },
            props: {
                id: "description",
                name: "description",
                label: "Description",
                browserApi: props.browserApi,
                deleteApi: props.deleteApi,
                uploadApi: props.uploadApi,
                folderCreateApi: props.folderCreateApi
            },
            sort_order: 70,
            id: "description"
        }
    ].filter((f) => {
        if (get(context, `data.product.${f.props.name}`) !== undefined)
            f.props.value = get(context, `data.product.${f.props.name}`);
        return f;
    });

    return <div className="product-edit-general sml-block">
        <div className="sml-block-title">General</div>
        <Area id="product-edit-general" coreWidgets={fields} />
    </div>;
}