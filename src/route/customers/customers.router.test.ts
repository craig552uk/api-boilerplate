import * as assert from "assert";
import * as Faker from "faker";
import "mocha";
import * as supertest from "supertest";
import { Customer, ICustomer } from "../../model/customer.model";
import { IUser, User } from "../../model/user.model";
import { testApplication as app } from "../../testrunner";

const LOGIN = Faker.internet.email();
const PASSWORD = "Passw0rd";

let customer1: ICustomer;
let customer2: ICustomer;
let customer3: ICustomer;
let user: IUser;
let admin: IUser;
let root: IUser;
let userToken: string;
let adminToken: string;
let rootToken: string;

describe("Customer API routes", () => {

    before(async () => {
        customer1 = await new Customer({
            email: LOGIN,
            name: Faker.company.companyName(),
        }).save() as ICustomer;

        customer2 = await new Customer({
            email: Faker.internet.email(),
            name: Faker.company.companyName(),
        }).save() as ICustomer;

        customer3 = await new Customer({
            email: Faker.internet.email(),
            name: Faker.company.companyName(),
        }).save() as ICustomer;

        user = await new User({
            customerId: customer1.id,
            login: LOGIN,
            name: Faker.name.findName(),
            password: PASSWORD,
        }).save();

        admin = await new User({
            admin: true,
            customerId: customer1.id,
            login: Faker.internet.email(),
            name: Faker.name.findName(),
            password: PASSWORD,
        }).save();

        root = await new User({
            admin: true,
            customerId: customer1.id,
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
                    assert.equal(res.body.total, 3);
                    assert.equal(res.body.pages, 1);
                    assert.equal(res.body.limit, 10);
                    assert.equal(res.body.page, 1);
                    assert.equal(res.body.docs.length, 3);
                    res.body.docs.forEach((u: IUser) => {
                        assert.equal(u.type, "Customer");
                    });
                })
                .end(done);
        });

        it("should return a page of Customers", (done) => {
            app.get("/customers?limit=2")
                .set("authorization", `Bearer ${rootToken}`)
                .expect("content-type", /json/)
                .expect(200)
                .expect((res: any) => {
                    assert.equal(res.body.total, 3);
                    assert.equal(res.body.pages, 2);
                    assert.equal(res.body.limit, 2);
                    assert.equal(res.body.page, 1);
                    assert.equal(res.body.docs.length, 2);
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
            app.get(`/customers/${customer1.id}`)
                .set("authorization", `Bearer ${rootToken}`)
                .expect("content-type", /json/)
                .expect(200)
                .expect((res: any) => {
                    assert.equal(res.body.docs.id, customer1.id);
                    assert.equal(res.body.docs.name, customer1.name);
                    assert.equal(res.body.docs.email, customer1.email);
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
            app.get(`/customers/${customer1.id}/users`)
                .set("authorization", `Bearer ${rootToken}`)
                .expect("content-type", /json/)
                .expect(200)
                .expect((res: any) => {
                    assert.equal(res.body.docs.length, 3);
                    res.body.docs.forEach((u: IUser) => {
                        assert.equal(u.type, "User");
                        assert.equal(u.customerId, customer1.id);
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

            app.patch(`/customers/${customer1.id}`)
                .send(data)
                .set("authorization", `Bearer ${rootToken}`)
                .expect("content-type", /json/)
                .expect(200)
                .expect((res: any) => {
                    assert.equal(res.body.docs.id, customer1.id);
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
            app.delete(`/customers/${customer1.id}`)
                .set("authorization", `Bearer ${rootToken}`)
                .expect("content-type", /json/)
                .expect(200)
                .expect((res: any) => {
                    assert.equal(res.body.docs.type, "Customer");
                    assert.equal(res.body.docs.id, customer1.id);
                })
                .end(done);
        });
    });

    describe("GET /customers/:id/users", () => {
        it("should return 401 `Unauthorized` if current User is not admin", (done) => {
            app.get(`/customers/${customer1.id}/users`)
                .set("authorization", `Bearer ${userToken}`)
                .expect("content-type", /json/)
                .expect(401)
                .end(done);
        });

        it("should return all Users for a Customer", (done) => {
            app.get(`/customers/${customer1.id}/users`)
                .set("authorization", `Bearer ${rootToken}`)
                .expect("content-type", /json/)
                .expect(200)
                .expect((res: any) => {
                    assert.equal(res.body.total, 3);
                    assert.equal(res.body.pages, 1);
                    assert.equal(res.body.limit, 10);
                    assert.equal(res.body.page, 1);
                    assert.equal(res.body.docs.length, 3);
                    res.body.docs.forEach((u: IUser) => {
                        assert.equal(u.customerId, customer1.id);
                        assert.equal(u.type, "User");
                    });
                })
                .end(done);
        });

        it("should return a page of Users for a Customer", (done) => {
            app.get(`/customers/${customer1.id}/users?limit=2`)
                .set("authorization", `Bearer ${rootToken}`)
                .expect("content-type", /json/)
                .expect(200)
                .expect((res: any) => {
                    assert.equal(res.body.total, 3);
                    assert.equal(res.body.pages, 2);
                    assert.equal(res.body.limit, 2);
                    assert.equal(res.body.page, 1);
                    assert.equal(res.body.docs.length, 2);
                    res.body.docs.forEach((u: IUser) => {
                        assert.equal(u.customerId, customer1.id);
                        assert.equal(u.type, "User");
                    });
                })
                .end(done);
        });
    });
});
