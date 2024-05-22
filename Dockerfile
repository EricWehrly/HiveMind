FROM node:lts-alpine

EXPOSE 5000
ENV PORT 5000

WORKDIR /hivemind

ADD . /hivemind

RUN yarn install

CMD ["yarn", "build"]

# CMD ["node", "server/index.js"]
