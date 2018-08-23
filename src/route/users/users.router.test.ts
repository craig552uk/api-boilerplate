import * as assert from "assert";
import * as Faker from "faker";
import "mocha";
import * as JWTService from "../../lib/jwt.service";
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

describe("User API routes", () => {

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

    describe("GET /users", () => {
        it("should return 401 `Unauthorized` if current User is not admin", (done) => {
            app.get("/users")
                .set("authorization", `Bearer ${userToken}`)
                .expect("content-type", /json/)
                .expect(401)
                .end(done);
        });

        it("should return all Users for this Customer", (done) => {
            app.get("/users")
                .set("authorization", `Bearer ${adminToken}`)
                .expect("content-type", /json/)
                .expect(200)
                .expect((res: any) => {
                    assert.equal(res.body.total, 3);
                    assert.equal(res.body.pages, 1);
                    assert.equal(res.body.limit, 10);
                    assert.equal(res.body.page, 1);
                    assert.equal(res.body.docs.length, 3);
                    res.body.docs.forEach((u: IUser) => {
                        assert.equal(u.customerId, customer.id);
                        assert.equal(u.type, "User");
                    });
                })
                .end(done);
        });

        it("should return a page of Users for this Customer", (done) => {
            app.get("/users?limit=2")
                .set("authorization", `Bearer ${adminToken}`)
                .expect("content-type", /json/)
                .expect(200)
                .expect((res: any) => {
                    assert.equal(res.body.total, 3);
                    assert.equal(res.body.pages, 2);
                    assert.equal(res.body.limit, 2);
                    assert.equal(res.body.page, 1);
                    assert.equal(res.body.docs.length, 2);
                    res.body.docs.forEach((u: IUser) => {
                        assert.equal(u.customerId, customer.id);
                        assert.equal(u.type, "User");
                    });
                })
                .end(done);
        });

        it("should search Users for this Customer", (done) => {
            app.get(`/users?q=${LOGIN}`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect("content-type", /json/)
                .expect(200)
                .expect((res: any) => {
                    assert.equal(res.body.total, 1);
                    assert.equal(res.body.pages, 1);
                    assert.equal(res.body.limit, 10);
                    assert.equal(res.body.page, 1);
                    assert.equal(res.body.docs.length, 1);
                    res.body.docs.forEach((u: IUser) => {
                        assert.equal(u.customerId, customer.id);
                        assert.equal(u.type, "User");
                        assert.equal(u.login, LOGIN);
                    });
                })
                .end(done);
        });
    });

    describe("POST /users", () => {
        it("should return 401 `Unauthorized` if current User is not admin", (done) => {
            app.post("/users")
                .set("authorization", `Bearer ${userToken}`)
                .expect("content-type", /json/)
                .expect(401)
                .end(done);
        });

        it("should return 400 `Bad Request` if name not provided", (done) => {
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

        it("should return 400 `Bad Request` if login not provided", (done) => {
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

        it("should return 400 `Bad Request` if password not provided", (done) => {
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

        it("should return 400 `Bad Request` if login is not an email address", (done) => {
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

        it("should create new User for this Customer", (done) => {
            const data = {
                login: Faker.internet.email(),
                name: Faker.name.findName(),
                password: "Passw0rd",
            };

            app.post("/users")
                .send(data)
                .set("authorization", `Bearer ${adminToken}`)
                .expect("content-type", /json/)
                .expect(200)
                .expect((res: any) => {
                    assert.equal(res.body.docs.customerId, customer.id);
                    assert.equal(res.body.docs.login, data.login);
                    assert.equal(res.body.docs.name, data.name);
                    assert.equal(res.body.docs.type, "User");
                })
                .end(done);
        });
    });

    describe("GET /users/:id", () => {
        it("should return 401 `Unauthorized` if current User is not admin", (done) => {
            app.get("/users/000000000000000000000000")
                .set("authorization", `Bearer ${userToken}`)
                .expect("content-type", /json/)
                .expect(401)
                .end(done);
        });

        it("should return 404 `Not Found` for non-existing id", (done) => {
            app.get("/users/000000000000000000000000")
                .set("authorization", `Bearer ${adminToken}`)
                .expect("content-type", /json/)
                .expect(404)
                .end(done);
        });

        it("should return a single User", (done) => {
            app.get(`/users/${user.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect("content-type", /json/)
                .expect(200)
                .expect((res: any) => {
                    assert.equal(res.body.docs.customerId, customer.id);
                    assert.equal(res.body.docs.id, user.id);
                    assert.equal(res.body.docs.type, "User");
                })
                .end(done);
        });
    });

    describe("PATCH /users/:id", () => {
        it("should return 401 `Unauthorized` if current User is not admin", (done) => {
            app.patch("/users/000000000000000000000000")
                .set("authorization", `Bearer ${userToken}`)
                .expect("content-type", /json/)
                .expect(401)
                .end(done);
        });

        it("should return 400 `Bad Request` if name not provided", (done) => {
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

        it("should return 400 `Bad Request` if login not provided", (done) => {
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

        it("should return 400 `Bad Request` if login is not an email address", (done) => {
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

        it("should return 404 `Not Found` for non-existing id", (done) => {
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

        it("should update User (excluding password)", (done) => {
            const data = {
                admin: !user.admin,
                login: Faker.internet.email(),
                name: Faker.name.findName(),
            };

            app.patch(`/users/${user.id}`)
                .send(data)
                .set("authorization", `Bearer ${adminToken}`)
                .expect("content-type", /json/)
                .expect(200)
                .expect((res: any) => {
                    assert.equal(res.body.docs.admin, data.admin);
                    assert.equal(res.body.docs.customerId, customer.id);
                    assert.equal(res.body.docs.id, user.id);
                    assert.equal(res.body.docs.login, data.login);
                    assert.equal(res.body.docs.name, data.name);
                    assert.equal(res.body.docs.type, "User");
                    assert.notEqual(res.body.docs.updatedAt, user.updatedAt);
                })
                .end(done);
        });

        it("should update User (including password)", (done) => {
            const data = {
                admin: !user.admin,
                login: Faker.internet.email(),
                name: Faker.name.findName(),
                password: "Passw0rd1",
            };

            app.patch(`/users/${user.id}`)
                .send(data)
                .set("authorization", `Bearer ${adminToken}`)
                .expect("content-type", /json/)
                .expect(200)
                .expect((res: any) => {
                    assert.equal(res.body.docs.admin, data.admin);
                    assert.equal(res.body.docs.customerId, customer.id);
                    assert.equal(res.body.docs.id, user.id);
                    assert.equal(res.body.docs.login, data.login);
                    assert.equal(res.body.docs.name, data.name);
                    assert.equal(res.body.docs.type, "User");
                    assert.notEqual(res.body.docs.updatedAt, user.updatedAt);
                })
                .end(done);
        });
    });

    describe("DELETE /users/:id", () => {
        it("should return 401 `Unauthorized` if current User is not admin", (done) => {
            app.delete("/users/000000000000000000000000")
                .set("authorization", `Bearer ${userToken}`)
                .expect("content-type", /json/)
                .expect(401)
                .end(done);
        });

        it("should return 404 `Not Found` for non-existing id", (done) => {
            app.delete("/users/000000000000000000000000")
                .set("authorization", `Bearer ${adminToken}`)
                .expect("content-type", /json/)
                .expect(404)
                .end(done);
        });

        it("should delete User", (done) => {
            app.delete(`/users/${user.id}`)
                .set("authorization", `Bearer ${adminToken}`)
                .expect("content-type", /json/)
                .expect(200)
                .expect((res: any) => {
                    assert.equal(res.body.docs.type, "User");
                    assert.equal(res.body.docs.customerId, customer.id);
                    assert.equal(res.body.docs.id, user.id);
                })
                .end(done);
        });
    });

    describe("GET /users/:id/impersonate", () => {
        it("should return 401 `Unauthorized` for non-root Users", (done) => {
            app.get("/users/000000000000000000000000/impersonate")
                .set("authorization", `Bearer ${userToken}`)
                .expect("content-type", /json/)
                .expect(401)
                .end(done);
        });

        it("should return 404 `Not Found` for non-existing id", (done) => {
            app.get("/users/000000000000000000000000/impersonate")
                .set("authorization", `Bearer ${rootToken}`)
                .expect("content-type", /json/)
                .expect(404)
                .end(done);
        });

        it("should return an impersonation token for User", (done) => {
            app.get(`/users/${admin.id}/impersonate`)
                .set("authorization", `Bearer ${rootToken}`)
                .expect("content-type", /json/)
                .expect(200)
                .expect((res: any) => {
                    assert.equal(res.body.type, "jwt");
                    const token = JWTService.decode(res.body.token);
                    assert.equal(token.id, admin.id);
                    assert.ok(token.impersonatedBy);
                    assert.equal(token.impersonatedBy.id, root.id);
                })
                .end(done);
        });
    });
});
