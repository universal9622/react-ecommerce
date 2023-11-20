const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getEnv } = require('@evershop/evershop/src/lib/util/getEnv');

const s3Client = new S3Client({ region: getEnv('AWS_REGION') });
const bucketName = getEnv('AWS_BUCKET_NAME');

module.exports.awsFolderCreator = {
  create: async (path) => {
    // Make sure path is not empty and has only 1 trailing slash at the end
    const requestedPath = path ? path.replace(/\/+$/, '') : '';
    if (!requestedPath) {
      throw new Error('Path is empty');
    } else {
      const params = {
        Bucket: bucketName,
        Key: requestedPath
      };

      const uploadCommand = new PutObjectCommand(params);
      await s3Client.send(uploadCommand);
    }
  }
};
