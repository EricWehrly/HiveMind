FROM node:lts-alpine

EXPOSE 5000
ENV PORT 5000

WORKDIR /hivemind

# ADD . .

CMD ["node", "server/index.js"]
