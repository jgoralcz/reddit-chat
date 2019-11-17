const bodyparser = require('body-parser');
const express = require('express');
const fs = require('fs');
const https = require('https');
const hsts = require('hsts');
const logger = require('log4js').getLogger();

logger.level = 'info';
const port = 8443;

const { errorHandler } = require('./middleware/ErrorHandler');
const { limiter } = require('./middleware/Limit');
const { httpLogger } = require('./middleware/Logger');

const router = require('./routes/Routes');

const { LOCAL, PROD, TEST } = require('./util/constants/environments');
const { serverCert, serverKey } = require('./util/constants/paths');

const env = process.env.NODE_ENV || LOCAL;

const server = express();

server.use(hsts({ maxAge: 31536000 }));
server.use(limiter);
server.use(bodyparser.urlencoded({ extended: true }));
server.use(bodyparser.json());
server.use(httpLogger());

server.use('/chat/', router, errorHandler);

if (env.toUpperCase() === PROD || env.toUpperCase() === TEST) {
  const certificate = { key: fs.readFileSync(serverKey), cert: fs.readFileSync(serverCert) };
  https.createServer(certificate, server).listen(port, () => logger.info(`${env.toUpperCase()} https server started on ${port}.`))
} else {
  server.listen(port, () => logger.info(`${env.toUpperCase()} server started on ${port}.`));
}
