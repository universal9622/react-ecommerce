/* eslint-disable react/jsx-closing-tag-location */
/* eslint-disable jsx-a11y/anchor-is-valid */
import PropTypes from 'prop-types';
import React from 'react';
import { Field } from '../../../../../../lib/components/form/Field';
import { Form } from '../../../../../../lib/components/form/Form';
import { useAlertContext } from '../../../../../../lib/components/modal/Alert';
import { toast } from 'react-toastify';

export default function GroupRow({ groups }) {
  const { openAlert, closeAlert, dispatchAlert } = useAlertContext();

  const onEdit = (group) => {
    openAlert({
      heading: `Editing ${group.groupName}`,
      content: <div>
        <Form
          id="groupEdit"
          method="PATCH"
          action={group.updateApi}
          submitBtn={false}
          onSuccess={(response) => {
            if (response.error) {
              toast.error(response.error.message);
            } else {
              location.reload();
            }
          }}
          isJSON={true}
        >
          <Field
            formId="group-edit"
            type="text"
            name="group_name"
            value={group.groupName}
          />
          <Field
            formId="group-edit"
            type="hidden"
            name="group_id"
            value={group.attributeGroupId}
          />
        </Form>
      </div>,
      primaryAction: {
        title: 'Cancel',
        onAction: closeAlert,
        variant: 'critical'

      },
      secondaryAction: {
        title: 'Save',
        onAction: () => {
          dispatchAlert({ type: 'update', payload: { secondaryAction: { isLoading: true } } });
          document.getElementById('groupEdit').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        },
        variant: 'primary',
        isLoading: false
      }
    });
  };

  return (
    <td>
      <div className="">
        {groups.map((group) => (
          <div key={group.attributeGroupId}>
            <a
              href="#"
              className="text-interactive hover:underline"
              onClick={(e) => {
                e.preventDefault();
                onEdit(group);
              }}
            >
              {group.groupName}
            </a>
          </div>
        ))}
      </div>
    </td>
  );
}

GroupRow.propTypes = {
  groups: PropTypes.arrayOf(PropTypes.shape({
    attributeGroupId: PropTypes.number,
    updateApi: PropTypes.string,
    groupName: PropTypes.string
  })).isRequired
};
