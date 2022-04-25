FROM node:lts-alpine

EXPOSE 5000

WORKDIR /hivemind

ADD . .

# CMD node index.js
CMD ["node", "server/index.js"]
