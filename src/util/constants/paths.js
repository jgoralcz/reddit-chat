const basePath = '/node/config/';

module.exports = Object.freeze({
  chatDB: `${basePath}/db.json`,
  serverCert: `${basePath}/cert.pem`,
  serverKey: `${basePath}/cert.key`,
});
