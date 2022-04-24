FROM node:lts-alpine

EXPOSE 5000

ADD index.js .

CMD node index.js