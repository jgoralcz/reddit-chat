const router = require('express-promise-router')();
const chat = require('./Chat');

router.use('/', chat);

module.exports = router;
