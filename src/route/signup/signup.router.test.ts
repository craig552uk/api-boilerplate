import "mocha";
import { join } from "path";
import { testApplication as app } from "../../testrunner";

const payload = {
    login: "foo@bar.com",
    name: "Jimbo Jones",
    nonce: Math.random(),
    organisationName: "Jimbo Jones's Organisation",
};

describe("Sign Up API routes", () => {

    describe("POST /signup", () => {

        it("should return 400 `Bad Request` if name is not provided", (done) => {
            app.post("/signup")
                .send({
                    login: "foo@bar.com",
                    // name: "Foo Bar",
                    nonce: Math.random(),
                    organisationName: "Foo Bar ltd.",
                })
                .expect(400)
                .expect("content-type", /json/)
                .expect({ message: "You must provide a name" })
                .end(done);
        });

        it("should return 400 `Bad Request` if login is not provided", (done) => {
            app.post("/signup")
                .send({
                    // login: "foo@bar.com",
                    name: "Foo Bar",
                    nonce: Math.random(),
                    organisationName: "Foo Bar ltd.",
                })
                .expect(400)
                .expect("content-type", /json/)
                .expect({ message: "You must provide a login" })
                .end(done);
        });

        it("should return 400 `Bad Request` if organisation name is not provided", (done) => {
            app.post("/signup")
                .send({
                    login: "foo@bar.com",
                    name: "Foo Bar",
                    nonce: Math.random(),
                    // organisationName: "Foo Bar ltd.",
                })
                .expect(400)
                .expect("content-type", /json/)
                .expect({ message: "You must provide an organisation name" })
                .end(done);
        });

        it("should return 400 `Bad Request` if login is not an email address", (done) => {
            app.post("/signup")
                .send({
                    login: "foobarcom",
                    name: "Foo Bar",
                    nonce: Math.random(),
                    organisationName: "Foo Bar ltd.",
                })
                .expect(400)
                .expect("content-type", /json/)
                .expect({ message: "Your login must be an email address" })
                .end(done);
        });

        xit("should return 400 `Bad Request` if login email has been used");
        xit("should create a new Customer with default settings");
        xit("should create a new User with admin privilages");
        xit("should return 200 with JWT after creating Customer and User ");
    });
});
