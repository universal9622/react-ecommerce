import React from "react";
import Area from "../../../../../../lib/components/area";
import { useAppState } from "../../../../../../lib/context/app";
import { get } from "../../../../../../lib/util/get";

const Name = ({ name }) => {
    return <h1 className="category-name text-center mt-25 mb-15">{name}</h1>
};

const Description = ({ description }) => {
    return <div className="category-description" dangerouslySetInnerHTML={{ __html: description }}></div>
};

export default function CategoryInfo() {
    const category = get(useAppState(), "category");

    return <div className="page-width">
        <Area
            id={"category-general-info"}
            className="category-general-info"
            coreComponents={[
                {
                    component: { default: Name },
                    props: { name: category.name },
                    sortOrder: 10,
                    id: "category-name"
                }
            ]}
        />
    </div>
}