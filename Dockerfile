# docker stop reddit-chat && docker rm reddit-chat && docker run -d -p 8443:8443 --restart always --memory="1024m" --cpuset-cpus='0' --cpus=1 --cpu-shares=512 -v $PWD/logs:/usr/src/node/logs --name reddit-chat reddit-chat
FROM node:latest

LABEL owner = jgoralcz
LABEL serviceVersion = 0.1.0
LABEL description = "Chatting with reddit comments."

ENV NODE_ENV=PROD

COPY --chown=node:node config.json /usr/src/node/
COPY --chown=node:node package*.json /usr/src/node/
COPY --chown=node:node src/ /usr/src/node/src/

WORKDIR /usr/src/node

EXPOSE 8443

USER node

RUN npm install

CMD ["npm", "start"]