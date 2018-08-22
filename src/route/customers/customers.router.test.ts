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
let root: IUser;
let userToken: string;
let adminToken: string;
let rootToken: string;

describe("Customer API routes", () => {

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

        root = await new User({
            admin: true,
            customerId: customer.id,
            login: Faker.internet.email(),
            name: Faker.name.findName(),
            password: PASSWORD,
            root: true,
        }).save();

        userToken = user.getJWT();
        adminToken = admin.getJWT();
        rootToken = root.getJWT();
    });

    describe("GET /customers", () => {
        it("should return 401 `Unauthorized` if current User is non-privilaged", (done) => {
            app.get("/customers")
                .set("authorization", `Bearer ${userToken}`)
                .expect("content-type", /json/)
                .expect(401)
                .end(done);
        });

        it("should return 401 `Unauthorized` if current User is admin", (done) => {
            app.get("/customers")
                .set("authorization", `Bearer ${adminToken}`)
                .expect("content-type", /json/)
                .expect(401)
                .end(done);
        });

        it("should return all Customers", (done) => {
            app.get("/customers")
                .set("authorization", `Bearer ${rootToken}`)
                .expect("content-type", /json/)
                .expect(200)
                .expect((res: any) => {
                    assert.equal(res.body.docs.length, 1);
                    res.body.docs.forEach((u: IUser) => {
                        assert.equal(u.type, "Customer");
                    });
                })
                .end(done);
        });
    });

    describe("POST /customers", () => {
        it("should return 401 `Unauthorized` if current User is non-privilaged", (done) => {
            app.post("/customers")
                .set("authorization", `Bearer ${userToken}`)
                .expect("content-type", /json/)
                .expect(401)
                .end(done);
        });

        it("should return 401 `Unauthorized` if current User is admin", (done) => {
            app.post("/customers")
                .set("authorization", `Bearer ${adminToken}`)
                .expect("content-type", /json/)
                .expect(401)
                .end(done);
        });

        it("should return 400 `Bad Request` if name not provided", (done) => {
            const data = {
                email: Faker.internet.email(),
            };

            app.post("/customers")
                .send(data)
                .set("authorization", `Bearer ${rootToken}`)
                .expect("content-type", /json/)
                .expect(400)
                .end(done);
        });

        it("should return 400 `Bad Request` if email not provided", (done) => {
            const data = {
                name: Faker.name.findName(),
            };

            app.post("/customers")
                .send(data)
                .set("authorization", `Bearer ${rootToken}`)
                .expect("content-type", /json/)
                .expect(400)
                .end(done);
        });

        it("should return 400 `Bad Request` if email is not a valid address", (done) => {
            const data = {
                email: Faker.name.findName(),
                name: Faker.name.findName(),
            };

            app.post("/customers")
                .send(data)
                .set("authorization", `Bearer ${rootToken}`)
                .expect("content-type", /json/)
                .expect(400)
                .end(done);
        });

        it("should create new Customer", (done) => {
            const data = {
                email: Faker.internet.email(),
                name: Faker.name.findName(),
            };

            app.post("/customers")
                .send(data)
                .set("authorization", `Bearer ${rootToken}`)
                .expect("content-type", /json/)
                .expect(200)
                .expect((res: any) => {
                    assert.equal(res.body.docs.email, data.email);
                    assert.equal(res.body.docs.name, data.name);
                    assert.equal(res.body.docs.type, "Customer");
                })
                .end(done);
        });
    });

    describe("GET /customers/:id", () => {
        it("should return 401 `Unauthorized` if current User is non-privilaged", (done) => {
            app.get("/customers/000000000000000000000000")
                .set("authorization", `Bearer ${userToken}`)
                .expect("content-type", /json/)
                .expect(401)
                .end(done);
        });

        it("should return 401 `Unauthorized` if current User is admin", (done) => {
            app.get("/customers/000000000000000000000000")
                .set("authorization", `Bearer ${adminToken}`)
                .expect("content-type", /json/)
                .expect(401)
                .end(done);
        });

        it("should return 404 `Not Found` for non-existing id", (done) => {
            app.get("/customers/000000000000000000000000")
                .set("authorization", `Bearer ${rootToken}`)
                .expect("content-type", /json/)
                .expect(404)
                .end(done);
        });

        it("should return a single Customer", (done) => {
            app.get(`/customers/${customer.id}`)
                .set("authorization", `Bearer ${rootToken}`)
                .expect("content-type", /json/)
                .expect(200)
                .expect((res: any) => {
                    assert.equal(res.body.docs.id, customer.id);
                    assert.equal(res.body.docs.name, customer.name);
                    assert.equal(res.body.docs.email, customer.email);
                    assert.equal(res.body.docs.type, "Customer");
                })
                .end(done);
        });
    });

    describe("GET /customers/:id/users", () => {
        it("should return 401 `Unauthorized` if current User is non-privilaged", (done) => {
            app.get("/customers/000000000000000000000000/users")
                .set("authorization", `Bearer ${userToken}`)
                .expect("content-type", /json/)
                .expect(401)
                .end(done);
        });

        it("should return 401 `Unauthorized` if current User is admin", (done) => {
            app.get("/customers/000000000000000000000000/users")
                .set("authorization", `Bearer ${adminToken}`)
                .expect("content-type", /json/)
                .expect(401)
                .end(done);
        });

        xit("should return 404 `Not Found` for non-existing id", (done) => {
            app.get("/customers/000000000000000000000000/users")
                .set("authorization", `Bearer ${rootToken}`)
                .expect("content-type", /json/)
                .expect(404)
                .end(done);
        });

        it("should return all Users for Customer", (done) => {
            app.get(`/customers/${customer.id}/users`)
                .set("authorization", `Bearer ${rootToken}`)
                .expect("content-type", /json/)
                .expect(200)
                .expect((res: any) => {
                    assert.equal(res.body.docs.length, 3);
                    res.body.docs.forEach((u: IUser) => {
                        assert.equal(u.type, "User");
                        assert.equal(u.customerId, customer.id);
                    });
                })
                .end(done);
        });
    });

    describe("PATCH /customers/:id", () => {
        it("should return 401 `Unauthorized` if current User is non-privilaged", (done) => {
            app.patch("/customers/000000000000000000000000")
                .set("authorization", `Bearer ${userToken}`)
                .expect("content-type", /json/)
                .expect(401)
                .end(done);
        });

        it("should return 401 `Unauthorized` if current User is admin", (done) => {
            app.patch("/customers/000000000000000000000000")
                .set("authorization", `Bearer ${adminToken}`)
                .expect("content-type", /json/)
                .expect(401)
                .end(done);
        });

        it("should return 400 `Bad Request` if name not provided", (done) => {
            const data = {
                email: Faker.internet.email(),
            };

            app.patch("/customers/000000000000000000000000")
                .send(data)
                .set("authorization", `Bearer ${rootToken}`)
                .expect("content-type", /json/)
                .expect(400)
                .end(done);
        });

        it("should return 400 `Bad Request` if email not provided", (done) => {
            const data = {
                name: Faker.name.findName(),
            };

            app.patch("/customers/000000000000000000000000")
                .send(data)
                .set("authorization", `Bearer ${rootToken}`)
                .expect("content-type", /json/)
                .expect(400)
                .end(done);
        });

        it("should return 400 `Bad Request` if email is not a valid address", (done) => {
            const data = {
                email: Faker.name.findName(),
                name: Faker.name.findName(),
            };

            app.patch("/customers/000000000000000000000000")
                .send(data)
                .set("authorization", `Bearer ${rootToken}`)
                .expect("content-type", /json/)
                .expect(400)
                .end(done);
        });

        it("should return 404 `Not Found` for non-existing id", (done) => {
            const data = {
                email: Faker.internet.email(),
                name: Faker.name.findName(),
            };

            app.patch("/customers/000000000000000000000000")
                .send(data)
                .set("authorization", `Bearer ${rootToken}`)
                .expect("content-type", /json/)
                .expect(404)
                .end(done);
        });

        it("should update Customer", (done) => {
            const data = {
                email: Faker.internet.email(),
                name: Faker.name.findName(),
            };

            app.patch(`/customers/${customer.id}`)
                .send(data)
                .set("authorization", `Bearer ${rootToken}`)
                .expect("content-type", /json/)
                .expect(200)
                .expect((res: any) => {
                    assert.equal(res.body.docs.id, customer.id);
                    assert.equal(res.body.docs.email, data.email);
                    assert.equal(res.body.docs.name, data.name);
                    assert.equal(res.body.docs.type, "Customer");
                    assert.notEqual(res.body.docs.updatedAt, user.updatedAt);
                })
                .end(done);
        });
    });

    describe("DELETE /customers/:id", () => {
        it("should return 401 `Unauthorized` if current User is non-admin", (done) => {
            app.delete("/customers/000000000000000000000000")
                .set("authorization", `Bearer ${userToken}`)
                .expect("content-type", /json/)
                .expect(401)
                .end(done);
        });

        it("should return 401 `Unauthorized` if current User is admin", (done) => {
            app.delete("/customers/000000000000000000000000")
                .set("authorization", `Bearer ${adminToken}`)
                .expect("content-type", /json/)
                .expect(401)
                .end(done);
        });

        it("should return 404 `Not Found` for non-existing id", (done) => {
            app.delete("/customers/000000000000000000000000")
                .set("authorization", `Bearer ${rootToken}`)
                .expect("content-type", /json/)
                .expect(404)
                .end(done);
        });

        it("should delete Customer", (done) => {
            app.delete(`/customers/${customer.id}`)
                .set("authorization", `Bearer ${rootToken}`)
                .expect("content-type", /json/)
                .expect(200)
                .expect((res: any) => {
                    assert.equal(res.body.docs.type, "Customer");
                    assert.equal(res.body.docs.id, customer.id);
                })
                .end(done);
        });
    });
});
