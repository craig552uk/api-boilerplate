FROM node:latest

WORKDIR /app
COPY . .

RUN npm install
RUN npm install typescript
RUN tsc

EXPOSE 1337

CMD [ "node", "index.js" ]
