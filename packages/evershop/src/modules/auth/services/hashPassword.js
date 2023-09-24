const bcrypt = require('bcryptjs');

module.exports.hashPassword = async function hashPassword(password) {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  return hash;
};
