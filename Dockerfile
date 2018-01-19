FROM node:latest

WORKDIR /app
COPY . .

ENV LOG_LEVEL=trace

RUN npm install
RUN npm install --global typescript
RUN tsc

EXPOSE 8000

CMD [ "node", "index.js", "--port", "8000" ]
