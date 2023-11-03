const path = require('path');
const { BlobServiceClient } = require('@azure/storage-blob');
const { getConfig } = require('@evershop/evershop/src/lib/util/getConfig');
const { getEnv } = require('@evershop/evershop/src/lib/util/getEnv');
const sharp = require('sharp');
const { update } = require('@evershop/postgres-query-builder');
const { pool } = require('@evershop/evershop/src/lib/postgres/connection');
const { debug } = require('@evershop/evershop/src/lib/log/debuger');

async function resizeAndUploadImage(
  containerName,
  originalBlobUrl,
  resizedBlobUrl,
  width,
  height
) {
  // Create a service client
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    getEnv('AZURE_STORAGE_CONNECTION_STRING')
  );
  const containerClient = blobServiceClient.getContainerClient(containerName);

  // originalBlobUrl is the full url of the blob, we need to get the blob path
  const originalBlobPath = originalBlobUrl.replace(
    `${containerClient.url}/`,
    ''
  );
  const originalBlobClient =
    containerClient.getBlockBlobClient(originalBlobPath);

  // Download the original image
  const originalImageBuffer = await originalBlobClient.downloadToBuffer();

  // Resize the image
  const resizedImageBuffer = await sharp(originalImageBuffer)
    .resize({ width, height, fit: 'inside' })
    .toBuffer();

  // Upload the resized image
  const resizedBlobPath = resizedBlobUrl.replace(`${containerClient.url}/`, '');
  const resizedBlobClient = containerClient.getBlockBlobClient(resizedBlobPath);
  await resizedBlobClient.upload(resizedImageBuffer, resizedImageBuffer.length);

  return resizedBlobClient.url;
}

module.exports = async function azureGenerateProductImageVariant(data) {
  if (getConfig('system.file_storage') === 'azure') {
    try {
      const containerName = getEnv('AZURE_STORAGE_CONTAINER_NAME', 'images');
      const originalBlobUrl = data.origin_image;
      // The data.image is the full url of the blob, we need to get the blob path
      // by removing the container url
      const ext = path.extname(originalBlobUrl);
      // Target path for single variant by adding a '-single' just before the extension
      const singleBlobUrl = originalBlobUrl.replace(ext, `-single${ext}`);
      // Target path for listing variant by adding a '-listing' just before the extension
      const listingBlobUrl = originalBlobUrl.replace(ext, `-listing${ext}`);
      // Target path for thumbnail variant by adding a '-thumbnail' just before the extension
      const thumbnailBlobUrl = originalBlobUrl.replace(ext, `-thumbnail${ext}`);

      // Upload the single variant
      const singleUrl = await resizeAndUploadImage(
        containerName,
        originalBlobUrl,
        singleBlobUrl,
        getConfig('catalog.product.image.single.width', 500),
        getConfig('catalog.product.image.single.height', 500)
      );

      // Upload the listing variant
      const listingUrl = await resizeAndUploadImage(
        containerName,
        originalBlobUrl,
        listingBlobUrl,
        getConfig('catalog.product.image.listing.width', 250),
        getConfig('catalog.product.image.listing.height', 250)
      );

      // Upload the thumbnail variant
      const thumnailUrl = await resizeAndUploadImage(
        containerName,
        originalBlobUrl,
        thumbnailBlobUrl,
        getConfig('catalog.product.image.thumbnail.width', 100),
        getConfig('catalog.product.image.thumbnail.height', 100)
      );

      // Update the record in the database with the new URLs in the variant columns
      await update('product_image')
        .given({
          single_image: singleUrl,
          listing_image: listingUrl,
          thumb_image: thumnailUrl
        })
        .where('product_image_product_id', '=', data.product_image_product_id)
        .and('origin_image', '=', data.origin_image)
        .execute(pool);
    } catch (error) {
      debug('critical', error);
    }
  }
};
