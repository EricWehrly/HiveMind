FROM node:lts-alpine

EXPOSE 5000
ENV PORT 5000

WORKDIR /hivemind

ADD . /hivemind

RUN yarn install

# TODO: Really, we need steps to build the production client, 
# and server
# and make sure all the files are where the server needs to serve them from
# then start the server (<-- this should be our 'cmd' so that 'docker compose build' can set up the files for distribution, eventually)

CMD ["yarn", "build"]

# CMD ["node", "server/index.js"]
