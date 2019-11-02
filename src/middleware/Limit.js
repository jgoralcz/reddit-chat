const rateLimit = require('express-rate-limit');
const { loginAdmin, passwordAdmin } = require('../../config.json');

const authentication = (auth) => {
  const b64auth = (auth || '').split(' ')[1] || '';
  const strauth = Buffer.from(b64auth, 'base64').toString();
  const splitIndex = strauth.indexOf(':');
  const login = strauth.substring(0, splitIndex);
  const password = strauth.substring(splitIndex + 1);

  return { login, password };
};

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  skip(req, _) {
    if (!req || !req.headers || !req.headers.authorization) return false;

    const { login, password } = authentication(req.headers.authorization);
    return login && password && login === loginAdmin && password === passwordAdmin;
  },
});

module.exports = {
  limiter,
};
