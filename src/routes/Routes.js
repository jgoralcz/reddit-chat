const router = require('express-promise-router')();
const chat = require('./Chat');

router.use('/chat', chat);

module.exports = router;
