import PropTypes from 'prop-types';
import React from 'react';
import Area from '../../../../../../lib/components/Area';
import { useAppState } from '../../../../../../lib/context/app';
import { get } from '../../../../../../lib/util/get';
import Ckeditor from '../../../../../../lib/components/form/fields/Ckeditor';
import { Field } from '../../../../../../lib/components/form/Field';
import { Card } from '../../../../../cms/views/admin/Card';

export default function General({
  browserApi, deleteApi, uploadApi, folderCreateApi
}) {
  const context = useAppState();
  const fields = [
    {
      component: { default: Field },
      props: {
        id: 'name',
        name: 'name',
        label: 'Name',
        validationRules: ['notEmpty'],
        type: 'text'
      },
      sortOrder: 10,
      id: 'name'
    },
    {
      component: { default: Field },
      props: {
        id: 'category_id',
        name: 'category_id',
        type: 'hidden'
      },
      sortOrder: 10,
      id: 'category_id'
    },
    {
      component: { default: Field },
      props: {
        id: 'status',
        type: 'radio',
        name: 'status',
        label: 'Status',
        options: [{ value: 0, text: 'Disabled' }, { value: 1, text: 'Enabled' }]
      },
      sortOrder: 30,
      id: 'status'
    },
    {
      component: { default: Ckeditor },
      props: {
        id: 'description',
        name: 'description',
        label: 'Description',
        browserApi,
        deleteApi,
        uploadApi,
        folderCreateApi
      },
      sortOrder: 70,
      id: 'description'
    }
  ].filter((f) => {
    // eslint-disable-next-line no-param-reassign
    if (get(context, `category.${f.props.name}`) !== undefined) { f.props.value = get(context, `category.${f.props.name}`); }
    return f;
  });

  return (
    <Card
      title="General"
    >
      <Card.Session>
        <Area id="category-edit-general" coreComponents={fields} />
      </Card.Session>
    </Card>
  );
}

General.propTypes = {
  browserApi: PropTypes.string.isRequired,
  deleteApi: PropTypes.string.isRequired,
  folderCreateApi: PropTypes.string.isRequired,
  uploadApi: PropTypes.string.isRequired
};
