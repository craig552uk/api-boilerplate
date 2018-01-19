import * as assert from "assert";
import "mocha";
import * as supertest from "supertest";
import { Customer } from "../../model/customer.model";
import { dbConnect, dbDisconnect, testApplication as app } from "../../testrunner";

describe("Sign Up API routes", () => {

    describe("POST /signup", () => {

        before(dbConnect);

        after(dbDisconnect);

        it("should return 400 `Bad Request` if name is not provided", (done) => {
            const payload = {
                login: "foo@bar.com",
                // name: "Foo Bar",
                organisationName: "Foo Bar ltd.",
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
                // login: "foo@bar.com",
                name: "Foo Bar",
                organisationName: "Foo Bar ltd.",
            };

            app.post("/signup")
                .send(payload)
                .expect(400)
                .expect("content-type", /json/)
                .expect({ message: "You must provide a login" })
                .end(done);
        });

        it("should return 400 `Bad Request` if organisation name is not provided", (done) => {
            const payload = {
                login: "foo@bar.com",
                name: "Foo Bar",
                // organisationName: "Foo Bar ltd.",
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
                login: "foobarcom",
                name: "Foo Bar",
                organisationName: "Foo Bar ltd.",
            };

            app.post("/signup")
                .send(payload)
                .expect(400)
                .expect("content-type", /json/)
                .expect({ message: "Your login must be an email address" })
                .end(done);
        });

        xit("should return 400 `Bad Request` if login email has been used");

        it("should create a new Customer with default settings", async () => {
            const payload = {
                login: "foo@bar.com",
                name: "Foo Bar",
                organisationName: "Foo Bar ltd.",
            };

            const beforeCount = await Customer.count({});
            const response = await app.post("/signup").send(payload);

            const afterCount = await Customer.count({});
            assert.equal(beforeCount + 1, afterCount);
        });

        xit("should create a new User with admin privilages");

        xit("should return 200 with JWT after creating Customer and User ");
    });
});
