FROM node:16

MAINTAINER Park

WORKDIR ./

COPY ./ ./

EXPOSE 3000

CMD ["node", "server.js"]
