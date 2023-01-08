import React from 'react';
import ProductMediaManager from './media/ProductMediaManager';
import { Card } from '../../../../cms/components/admin/Card';

export default function Media({ id, product, productImageUploadUrl }) {
  const image = product?.image;
  let gallery = product?.gallery || [];

  if (image) {
    gallery = [image].concat(gallery);
  }
  return (
    <Card
      title="Media"
    >
      <Card.Session>
        <ProductMediaManager id={id || 'images'} productImages={gallery} productImageUploadUrl={productImageUploadUrl} />
      </Card.Session>
    </Card>
  );
}

export const layout = {
  areaId: 'leftSide',
  sortOrder: 15
}

export const query = `
  query Query {
    product(id: getContextValue("productId", null)) {
      image {
        id: uniqueId
        url: origin
        path
      }
      gallery {
        id: uniqueId
        url: origin
        path
      }
    }
    productImageUploadUrl: url(routeId: "imageUpload", params: [{key: "0", value: ""}])
  }
`;