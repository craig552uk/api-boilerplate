import * as assert from "assert";
import * as Faker from "faker";
import "mocha";
import * as supertest from "supertest";
import * as JWTService from "../../lib/jwt.service";
import { Customer } from "../../model/customer.model";
import { User } from "../../model/user.model";
import { dbConnect, dbDisconnect, testApplication as app } from "../../testrunner";

describe("Sign Up API routes", () => {

    describe("POST /signup", () => {

        before(dbConnect);

        after(dbDisconnect);

        it("should return 400 `Bad Request` if name is not provided", (done) => {
            const payload = {
                login: Faker.internet.email(),
                organisationName: Faker.company.companyName(),
                password1: "Passw0rd",
                password2: "Passw0rd",
            };

            app.post("/signup")
                .send(payload)
                .expect(400)
                .expect("content-type", /json/)
                .expect({ message: "You must provide a name" })
                .end(done);
        });

        it("should return 400 `Bad Request` if login is not provided", (done) => {
            const payload = {
                name: Faker.name.findName(),
                organisationName: Faker.company.companyName(),
                password1: "Passw0rd",
                password2: "Passw0rd",
            };

            app.post("/signup")
                .send(payload)
                .expect(400)
                .expect("content-type", /json/)
                .expect({ message: "You must provide a login" })
                .end(done);
        });

        it("should return 400 `Bad Request` if password is not provided", (done) => {
            const payload = {
                login: Faker.internet.email(),
                name: Faker.name.findName(),
                organisationName: Faker.company.companyName(),
                password2: "Passw0rd",
            };

            app.post("/signup")
                .send(payload)
                .expect(400)
                .expect("content-type", /json/)
                .expect({ message: "You must provide a password" })
                .end(done);
        });

        it("should return 400 `Bad Request` if password confirmation is not provided", (done) => {
            const payload = {
                login: Faker.internet.email(),
                name: Faker.name.findName(),
                organisationName: Faker.company.companyName(),
                password1: "Passw0rd",
            };

            app.post("/signup")
                .send(payload)
                .expect(400)
                .expect("content-type", /json/)
                .expect({ message: "You must provide your password twice" })
                .end(done);
        });

        it("should return 400 `Bad Request` if organisation name is not provided", (done) => {
            const payload = {
                login: Faker.internet.email(),
                name: Faker.name.findName(),
                password1: "Passw0rd",
                password2: "Passw0rd",
            };

            app.post("/signup")
                .send(payload)
                .expect(400)
                .expect("content-type", /json/)
                .expect({ message: "You must provide an organisation name" })
                .end(done);
        });

        it("should return 400 `Bad Request` if login is not an email address", (done) => {
            const payload = {
                login: Faker.lorem.words(),
                name: Faker.name.findName(),
                organisationName: Faker.company.companyName(),
                password1: "Passw0rd",
                password2: "Passw0rd",
            };

            app.post("/signup")
                .send(payload)
                .expect(400)
                .expect("content-type", /json/)
                .expect({ message: "Your login must be an email address" })
                .end(done);
        });

        it("should return 400 `Bad Request` if passwords do not match", (done) => {
            const payload = {
                login: Faker.internet.email(),
                name: Faker.name.findName(),
                organisationName: Faker.company.companyName(),
                password1: "Passw0rd1",
                password2: "Passw0rd2",
            };

            app.post("/signup")
                .send(payload)
                .expect(400)
                .expect("content-type", /json/)
                .expect({ message: "Your passwords do not match" })
                .end(done);
        });

        it("should return 400 `Bad Request` if password is too short", (done) => {
            const payload = {
                login: Faker.internet.email(),
                name: Faker.name.findName(),
                organisationName: Faker.company.companyName(),
                password1: "Passw0r",
                password2: "Passw0r",
            };

            app.post("/signup")
                .send(payload)
                .expect(400)
                .expect("content-type", /json/)
                .expect({
                    message: "Password must be at least 8 characters and may only use a-z, A-Z, 0-9 and $@$!%*?&",
                })
                .end(done);
        });

        xit("should return 400 `Bad Request` if login email has been used");

        it("should create a new Customer with default settings", async () => {
            const payload = {
                login: Faker.internet.email(),
                name: Faker.name.findName(),
                organisationName: Faker.company.companyName(),
                password1: "Passw0rd",
                password2: "Passw0rd",
            };

            const beforeCount = await Customer.count({});
            const response = await app.post("/signup").send(payload);

            const afterCount = await Customer.count({});
            assert.equal(beforeCount + 1, afterCount);
        });

        it("should create a new User with admin privilages", async () => {
            const payload = {
                login: Faker.internet.email(),
                name: Faker.name.findName(),
                organisationName: Faker.company.companyName(),
                password1: "Passw0rd",
                password2: "Passw0rd",
            };

            const beforeCount = await User.count({});
            const response = await app.post("/signup").send(payload);

            const afterCount = await User.count({});
            assert.equal(beforeCount + 1, afterCount);
        });

        it("should return 200 with JWT after creating Customer and User", async () => {
            const payload = {
                login: Faker.internet.email(),
                name: Faker.name.findName(),
                organisationName: Faker.company.companyName(),
                password1: "Passw0rd",
                password2: "Passw0rd",
            };

            const response = await app.post("/signup").send(payload);

            assert.ok(JWTService.verify(response.body.token));
            assert.equal(response.body.type, "jwt");
        });
    });
});
