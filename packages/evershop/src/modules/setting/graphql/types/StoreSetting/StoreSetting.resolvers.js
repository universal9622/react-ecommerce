module.exports = {
  Setting: {
    storeName: (setting) => {
      const storeName = setting.find((s) => s.name === 'storeName');
      if (storeName) {
        return storeName.value;
      } else {
        return 'An Amazing EverShop Store';
      }
    },
    storeDescription: (setting) => {
      const storeDescription = setting.find(
        (s) => s.name === 'storeDescription'
      );
      if (storeDescription) {
        return storeDescription.value;
      } else {
        return 'An Amazing EverShop Store';
      }
    },
    storeLanguage: (setting) => {
      const storeLanguage = setting.find((s) => s.name === 'storeLanguage');
      if (storeLanguage) {
        return storeLanguage.value;
      } else {
        return 'en';
      }
    },
    storeCurrency: (setting) => {
      const storeCurrency = setting.find((s) => s.name === 'storeCurrency');
      if (storeCurrency) {
        return storeCurrency.value;
      } else {
        return 'USD';
      }
    },
    storeTimeZone: (setting) => {
      const storeTimeZone = setting.find((s) => s.name === 'storeTimeZone');
      if (storeTimeZone) {
        return storeTimeZone.value;
      } else {
        return 'America/New_York';
      }
    },
    storePhoneNumber: (setting) => {
      const storePhoneNumber = setting.find(
        (s) => s.name === 'storePhoneNumber'
      );
      if (storePhoneNumber) {
        return storePhoneNumber.value;
      } else {
        return null;
      }
    },
    storeEmail: (setting) => {
      const storeEmail = setting.find((s) => s.name === 'storeEmail');
      if (storeEmail) {
        return storeEmail.value;
      } else {
        return null;
      }
    },
    storeCountry: (setting) => {
      const storeCountry = setting.find((s) => s.name === 'storeCountry');
      if (storeCountry) {
        return storeCountry.value;
      } else {
        return 'US';
      }
    },
    storeAddress: (setting) => {
      const storeAddress = setting.find((s) => s.name === 'storeAddress');
      if (storeAddress) {
        return storeAddress.value;
      } else {
        return null;
      }
    },
    storeCity: (setting) => {
      const storeCity = setting.find((s) => s.name === 'storeCity');
      if (storeCity) {
        return storeCity.value;
      } else {
        return null;
      }
    },
    storeProvince: (setting) => {
      const storeProvince = setting.find((s) => s.name === 'storeProvince');
      if (storeProvince) {
        return storeProvince.value;
      } else {
        return null;
      }
    },
    storePostalCode: (setting) => {
      const storePostalCode = setting.find((s) => s.name === 'storePostalCode');
      if (storePostalCode) {
        return storePostalCode.value;
      } else {
        return null;
      }
    }
  }
};
