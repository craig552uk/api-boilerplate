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
let token: string;

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

        token = user.getJWT();
    });

    describe("PATCH /settings/password", () => {
        xit("should return 400 `Bad Request` if incorrect current password provided");
        xit("should return 400 `Bad Request` if new passwords does not match confirmation");
        xit("should return 200 `OK` if password successfully updated");
    });

    describe("GET /settings/profile", () => {
        xit("should return settings for current User");
    });

    describe("PATCH /settings/profile", () => {
        xit("should return 400 `Bad Request` if invalid name provided");
        xit("should return 400 `Bad Request` if invalid login provided");
        xit("should return 200 `OK` if profile successfully updated");
    });

    describe("GET /settings/account", () => {
        xit("should return 401 `Unauthorized` if current User is not an admin");
        xit("should return settings for Customer if current User is an admin");
    });

    describe("PATCH /settings/account", () => {
        xit("should return 401 `Unauthorized` if current User is not admin");
        xit("should return 400 `Bad Request` if invalid email provided");
        xit("should return 200 `OK` if account successfully updated");
    });
});
