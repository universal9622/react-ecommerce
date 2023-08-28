const fs = require('fs');
const { getConfig } = require('../../util/getConfig');
const path = require('path');
const { CONSTANTS } = require('../../helpers');
const { readCsvFile } = require('../../util/readCsvFile');
const { error } = require('../../log/debuger');

module.exports.loadCsvTranslationFiles =
  async function loadCsvTranslationFiles() {
    try {
      const language = getConfig('shop.language', 'en');
      const folderPath = path.resolve(
        CONSTANTS.ROOTPATH,
        'translations',
        language
      );

      // Check if path exists
      if (!fs.existsSync(folderPath)) {
        return {};
      }

      const results = {};

      const files = await fs.promises.readdir(folderPath);
      const csvFiles = files.filter((file) => path.extname(file) === '.csv');
      const filePromises = csvFiles.map((file) => {
        const filePath = path.join(folderPath, file);
        return readCsvFile(filePath);
      });

      const fileDataList = await Promise.all(filePromises);
      for (const fileData of fileDataList) {
        for (const [key, value] of Object.entries(fileData)) {
          results[key] = value;
        }
      }

      return results;
    } catch (err) {
      error(err);
    }
  };
