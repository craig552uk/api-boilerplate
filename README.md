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

Local development will require a MongoDB, run a temporary container with:

```
$ docker run -it --rm -p 27017:27017 --name mongo -t mongo:latest
```

Customer and User Models
------------------------

The top-level entity in the application is the Customer. All other entities belong to one, and only one Customer.

Customers have one or more Users.

There are three levels of access for Users, non-privilaged, administrator and god.

Non-privilaged Users can only access API routes for standard application functionality.

Admin Users have the same level of access as non-privilaged Users, and can also manage Users for their own Customer (including grant administrator privilages).

God Users have the ability to impersonate any other User, can manage all Customers in the service and can grant god-level privilages to any other User.

A new instalation must have an initial Customer with at least one god User.

Newly created Customers must have at least one admin User.
