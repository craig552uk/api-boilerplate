FROM node:latest

WORKDIR /app
COPY . .

RUN npm install
RUN npm install typescript
RUN tsc

EXPOSE 8000

CMD [ "node", "index.js", "--port", "8000" ]
