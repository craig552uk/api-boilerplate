import * as assert from "assert";
import * as Faker from "faker";
import "mocha";
import * as supertest from "supertest";
import * as JWTService from "../../lib/jwt.service";
import { Customer } from "../../model/customer.model";
import { User } from "../../model/user.model";
import { dbConnect, dbDisconnect, testApplication as app } from "../../testrunner";

describe("Authentication API routes", () => {

    before(dbConnect);

    after(dbDisconnect);

    describe("GET /login", () => {
        xit("should return 400 `Bad Request` if Authorization header not provided");
        xit("should return 400 `Bad Request` if malformed Authorization header provided");
        xit("should return 401 `Unauthorized` if bad username provided");
        xit("should return 401 `Unauthorized` if bad password provided");
        xit("should return 401 `Unauthorized` if User is deactivated");
        xit("should return JWT if User can authenticate");
    });

    describe("GET /whoami with JWT in Authorization Header", () => {
        xit("should return 400 `Bad Request` if JWT not provided");
        xit("should return 400 `Bad Request` if JWT is malformed");
        xit("should return User object for authenticated User");
    });

    describe("GET /whoami with JWT in Query String", () => {
        xit("should return 400 `Bad Request` if JWT not provided");
        xit("should return 400 `Bad Request` if JWT is malformed");
        xit("should return User object for authenticated User");
    });
});
