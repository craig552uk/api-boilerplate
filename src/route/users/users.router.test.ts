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
        it("should return 401 `Unauthorized` if current User is not admin", (done) => {
            app.get("/users")
                .set("authorization", `Bearer ${userToken}`)
                .expect("content-type", /json/)
                .expect(401)
                .end(done);
        });

        xit("Should return all Users for this Customer");
    });

    describe("POST /users", () => {
        it("should return 401 `Unauthorized` if current User is not admin", (done) => {
            app.post("/users")
                .set("authorization", `Bearer ${userToken}`)
                .expect("content-type", /json/)
                .expect(401)
                .end(done);
        });

        it("Should return 400 `Bad Request` if name not provided", (done) => {
            const data = {
                login: Faker.internet.email(),
                password: "Passw0rd",
            };

            app.post("/users")
                .send(data)
                .set("authorization", `Bearer ${adminToken}`)
                .expect("content-type", /json/)
                .expect(400)
                .end(done);
        });

        it("Should return 400 `Bad Request` if login not provided", (done) => {
            const data = {
                name: Faker.name.findName(),
                password: "Passw0rd",
            };

            app.post("/users")
                .send(data)
                .set("authorization", `Bearer ${adminToken}`)
                .expect("content-type", /json/)
                .expect(400)
                .end(done);
        });

        it("Should return 400 `Bad Request` if password not provided", (done) => {
            const data = {
                login: Faker.internet.email(),
                name: Faker.name.findName(),
            };

            app.post("/users")
                .send(data)
                .set("authorization", `Bearer ${adminToken}`)
                .expect("content-type", /json/)
                .expect(400)
                .end(done);
        });

        it("Should return 400 `Bad Request` if login is not an email address", (done) => {
            const data = {
                login: Faker.name.findName(),
                name: Faker.name.findName(),
                password: "Passw0rd",
            };

            app.post("/users")
                .send(data)
                .set("authorization", `Bearer ${adminToken}`)
                .expect("content-type", /json/)
                .expect(400)
                .end(done);
        });

        xit("Should create new User for this Customer");
    });

    describe("GET /users/:id", () => {
        it("should return 401 `Unauthorized` if current User is not admin", (done) => {
            app.get("/users/000000000000000000000000")
                .set("authorization", `Bearer ${userToken}`)
                .expect("content-type", /json/)
                .expect(401)
                .end(done);
        });

        it("Should return 404 `Not Found` for non-existing id", (done) => {
            app.get("/users/000000000000000000000000")
                .set("authorization", `Bearer ${adminToken}`)
                .expect("content-type", /json/)
                .expect(404)
                .end(done);
        });

        xit("Should return a single User");
    });

    describe("PATCH /users/:id", () => {
        it("should return 401 `Unauthorized` if current User is not admin", (done) => {
            app.patch("/users/000000000000000000000000")
                .set("authorization", `Bearer ${userToken}`)
                .expect("content-type", /json/)
                .expect(401)
                .end(done);
        });

        it("Should return 400 `Bad Request` if name not provided", (done) => {
            const data = {
                login: Faker.internet.email(),
            };

            app.patch("/users/000000000000000000000000")
                .send(data)
                .set("authorization", `Bearer ${adminToken}`)
                .expect("content-type", /json/)
                .expect(400)
                .end(done);
        });

        it("Should return 400 `Bad Request` if login not provided", (done) => {
            const data = {
                name: Faker.name.findName(),
            };

            app.patch("/users/000000000000000000000000")
                .send(data)
                .set("authorization", `Bearer ${adminToken}`)
                .expect("content-type", /json/)
                .expect(400)
                .end(done);
        });

        it("Should return 400 `Bad Request` if login is not an email address", (done) => {
            const data = {
                login: Faker.name.findName(),
                name: Faker.name.findName(),
            };

            app.patch("/users/000000000000000000000000")
                .send(data)
                .set("authorization", `Bearer ${adminToken}`)
                .expect("content-type", /json/)
                .expect(400)
                .end(done);
        });

        it("Should return 404 `Not Found` for non-existing id", (done) => {
            const data = {
                login: Faker.internet.email(),
                name: Faker.name.findName(),
            };

            app.patch("/users/000000000000000000000000")
                .send(data)
                .set("authorization", `Bearer ${adminToken}`)
                .expect("content-type", /json/)
                .expect(404)
                .end(done);
        });

        xit("Should update User (excluding password)");
        xit("Should update User (including password)");
    });

    describe("DELETE /users/:id", () => {
        it("should return 401 `Unauthorized` if current User is not admin", (done) => {
            app.delete("/users/000000000000000000000000")
                .set("authorization", `Bearer ${userToken}`)
                .expect("content-type", /json/)
                .expect(401)
                .end(done);
        });

        it("Should return 404 `Not Found` for non-existing id", (done) => {
            app.delete("/users/000000000000000000000000")
                .set("authorization", `Bearer ${adminToken}`)
                .expect("content-type", /json/)
                .expect(404)
                .end(done);
        });

        xit("Should delete User");
    });
});
