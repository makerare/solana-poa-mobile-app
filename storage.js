import EncryptedStorage from 'react-native-encrypted-storage';

const storage = {
  async getItem(key) {
    const ret = JSON.parse(await EncryptedStorage.getItem(key));
    global.firstGet = true;
    return ret;
  },
  async setItem(key, data) {
    EncryptedStorage.setItem(key, JSON.stringify(data));
  },
  async removeItem(key) {
    EncryptedStorage.removeItem(key);
  },
};

export default storage;
