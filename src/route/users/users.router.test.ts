import * as assert from "assert";
import * as Faker from "faker";
import "mocha";
import * as supertest from "supertest";
import { Customer, ICustomer } from "../../model/customer.model";
import { IUser, User } from "../../model/user.model";
import { testApplication as app } from "../../testrunner";

const LOGIN = Faker.internet.email();
const PASSWORD = "Passw0rd";

let customer: ICustomer;
let user: IUser;
let admin: IUser;
let userToken: string;
let adminToken: string;

describe("Settings API routes", () => {

    before(async () => {
        customer = await new Customer({
            email: LOGIN,
            name: Faker.company.companyName(),
        }).save() as ICustomer;

        user = await new User({
            customerId: customer.id,
            login: LOGIN,
            name: Faker.name.findName(),
            password: PASSWORD,
        }).save();

        admin = await new User({
            admin: true,
            customerId: customer.id,
            login: Faker.internet.email(),
            name: Faker.name.findName(),
            password: PASSWORD,
        }).save();

        userToken = user.getJWT();
        adminToken = admin.getJWT();
    });

    describe("GET /users", () => {
        xit("Should deny non-admin Users");
        xit("Should return all Users for this Customer");
    });

    describe("POST /users", () => {
        xit("Should deny non-admin Users");
        xit("Should return 400 `Bad Request` if name not provided");
        xit("Should return 400 `Bad Request` if login not provided");
        xit("Should return 400 `Bad Request` if password not provided");
        xit("Should return 400 `Bad Request` if login is not an email address");
        xit("Should create new User for this Customer");
    });

    describe("GET /users/:id", () => {
        xit("Should deny non-admin Users");
        xit("Should return 404 `Not Found` for non-existing id");
        xit("Should return a single User");
    });

    describe("PATCH /users/:id", () => {
        xit("Should deny non-admin Users");
        xit("Should return 404 `Not Found` for non-existing id");
        xit("Should return 400 `Bad Request` if name not provided");
        xit("Should return 400 `Bad Request` if login not provided");
        xit("Should return 400 `Bad Request` if login is not an email address");
        xit("Should update User (excluding password)");
        xit("Should update User (including password)");
    });

    describe("DELETE /users/:id", () => {
        xit("Should deny non-admin Users");
        xit("Should return 404 `Not Found` for non-existing id");
        xit("Should delete User");
    });
});
