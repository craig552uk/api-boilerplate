Featherback API
===============

Built with

* Express
* TypeScript
* Mongoose

Getting Started
---------------

Install dependencies with:

```
$ npm install
$ npm install --global typescript
```

Build and start local server with:

```
$ tsc
$ node index.js
```

Build and start Docker image with:

```
$ docker build -t api.featherback.co:latest -t api.featherback.co:0.0.0 .
$ docker run -d -p 1337:1337 --name api.featherback.co api.featherback.co:latest
```
