import React from "react";
import { Checkbox } from "./fields/Checkbox";
import { Date } from "./fields/Date";
import { DateTime } from "./fields/DateTime";
import { Input } from "./fields/Input";
import { MultiSelect } from "./fields/MultiSelect";
import { Radio } from "./fields/Radio";
import { Select } from "./fields/Select";
import { TextArea } from "./fields/Textarea";
import { Toggle } from "./fields/Toggle";
import { useFormContext } from "./Form";

export function Field(props) {
    const context = useFormContext();
    const [value, setValue] = React.useState("");
    const field = context.fields.find((f) => f.name === props.name);

    React.useEffect(() => {
        context.addField(props.name, props.value, props.validationRules || []);

        return () => {
            context.removeField(props.name);
        };
    }, []);

    React.useEffect(() => {
        setValue(props.value ? props.value : "");
        context.updateField(props.name, props.value ? props.value : "", props.validationRules);
    }, [props.value]);

    const onChange = (value) => {
        setValue(value);
        context.updateField(props.name, value, props.validationRules);
        if (props.onChange) props.onChange.call(window, value, props);
    };

    let Field = (() => {
        switch (props.type) {
            case 'text':
                return Input
                break;
            case 'select':
                return Select
                break;
            case 'multiselect':
                return MultiSelect
                break;
            case 'checkbox':
                return Checkbox
                break;
            case 'radio':
                return Radio
                break;
            case 'toggle':
                return Toggle
                break;
            case 'date':
                return Date
                break;
            case 'datetime':
                return DateTime
                break;
            case 'textarea':
                return TextArea
                break;
        }
    })();
    return <>
        <Field {...props} onChange={onChange} value={value} error={field ? field.error : undefined} />
    </>
}