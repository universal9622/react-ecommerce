import React from "react";
import Area from "../../../../../../lib/components/area";
import { useAppState } from "../../../../../../lib/context/app";
import { get } from "../../../../../../lib/util/get";
import Ckeditor from "../../../../../../lib/components/form/fields/Ckeditor";
import { Field } from "../../../../../../lib/components/form/Field";
import { Card } from "../../../../../cms/components/admin/card";
import { buildAdminUrl } from "../../../../../../lib/routie";

const SKUPriceWeight = ({ sku, price, weight }) => {
    return <div className='grid grid-cols-3 gap-1 mt-15'>
        <div>
            <Field
                id="sku"
                name="sku"
                value={sku}
                placeholder="SKU"
                label="SKU"
                type="text"
            />
        </div>
        <div>
            <Field
                id="price"
                name="price"
                value={price}
                placeholder="Price"
                label="Price"
                type="text"
            />
        </div>
        <div>
            <Field
                id="weight"
                name="weight"
                value={weight}
                placeholder="Weight"
                label="Weight"
                type="text"
            />
        </div>
    </div>
}
export default function General(props) {
    const context = useAppState();

    return <Card
        title="General"
    >
        <Card.Session>
            <Area id="product-edit-general" coreComponents={[
                {
                    component: { default: Field },
                    props: {
                        id: "name",
                        name: "name",
                        label: "Name",
                        value: get(context, `product.name`),
                        validationRules: ["notEmpty"],
                        type: "text",
                        placeholder: "Name"
                    },
                    sortOrder: 10,
                    id: "name"
                },
                {
                    component: { default: SKUPriceWeight },
                    props: {
                        sku: get(context, `product.sku`),
                        price: get(context, `product.price`),
                        weight: get(context, `product.weight`),
                    },
                    sortOrder: 20,
                    id: "SKUPriceWeight"
                },
                {
                    component: { default: Ckeditor },
                    props: {
                        id: "description",
                        name: "description",
                        label: "Description",
                        value: get(context, `product.description`),
                        browserApi: props.browserApi,
                        deleteApi: props.deleteApi,
                        uploadApi: props.uploadApi,
                        folderCreateApi: props.folderCreateApi
                    },
                    sortOrder: 30,
                    id: "description"
                }
            ]} />
        </Card.Session>
    </Card>;
}