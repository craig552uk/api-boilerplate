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

    describe("GET /settings/profile", () => {
        it("should return settings for current User", (done) => {
            app.get("/settings/profile")
                .set("authorization", `Bearer ${userToken}`)
                .expect(200)
                .expect("content-type", /json/)
                .expect((res: any) => {
                    const userJSON = JSON.parse(JSON.stringify(user)) as IUser;
                    assert.equal(userJSON.admin, res.body.docs.admin);
                    assert.equal(userJSON.createdAt, res.body.docs.createdAt);
                    assert.equal(userJSON.customerId, res.body.docs.customerId);
                    assert.equal(userJSON.id, res.body.docs.id);
                    assert.equal(userJSON.login, res.body.docs.login);
                    assert.equal(userJSON.name, res.body.docs.name);
                    assert.equal(userJSON.root, res.body.docs.root);
                    assert.equal(userJSON.type, res.body.docs.type);
                    assert.equal(userJSON.updatedAt, res.body.docs.updatedAt);
                })
                .end(done);
        });
    });

    describe("PATCH /settings/password", () => {
        it("should return 400 `Bad Request` current password not provided", (done) => {
            app.patch("/settings/password")
                .set("authorization", `Bearer ${userToken}`)
                .send({
                    newPassword1: "Passw0rd",
                    newPassword2: "Passw0rd",
                })
                .expect("content-type", /json/)
                .expect(400)
                .expect({ message: "You must provide your current password" })
                .end(done);
        });

        it("should return 400 `Bad Request` if new password 1 not provided", (done) => {
            app.patch("/settings/password")
                .set("authorization", `Bearer ${userToken}`)
                .send({
                    currentPassword: PASSWORD,
                    newPassword2: "Passw0rd",
                })
                .expect("content-type", /json/)
                .expect(400)
                .expect({ message: "You must provide a new password" })
                .end(done);
        });

        it("should return 400 `Bad Request` if new password 2 not provided", (done) => {
            app.patch("/settings/password")
                .set("authorization", `Bearer ${userToken}`)
                .send({
                    currentPassword: PASSWORD,
                    newPassword1: "Passw0rd",
                })
                .expect("content-type", /json/)
                .expect(400)
                .expect({ message: "You must provide a new password twice" })
                .end(done);
        });

        it("should return 400 `Bad Request` if incorrect current password provided", (done) => {
            app.patch("/settings/password")
                .set("authorization", `Bearer ${userToken}`)
                .send({
                    currentPassword: "badPassw0rd",
                    newPassword1: "Passw0rd",
                    newPassword2: "Passw0rd",
                })
                .expect("content-type", /json/)
                .expect(400)
                .expect({ message: "Incorrect password provided" })
                .end(done);
        });

        it("should return 400 `Bad Request` if new passwords do not match", (done) => {
            app.patch("/settings/password")
                .set("authorization", `Bearer ${userToken}`)
                .send({
                    currentPassword: PASSWORD,
                    newPassword1: "Passw0rd1",
                    newPassword2: "Passw0rd2",
                })
                .expect("content-type", /json/)
                .expect(400)
                .expect({ message: "New passwords do not match" })
                .end(done);
        });

        it("should return 200 `OK` if password successfully updated", (done) => {
            app.patch("/settings/password")
                .set("authorization", `Bearer ${userToken}`)
                .send({
                    currentPassword: PASSWORD,
                    newPassword1: "Passw0rd1",
                    newPassword2: "Passw0rd1",
                })
                .expect(200)
                .expect("content-type", /json/)
                .expect((res: any) => {
                    const userJSON = JSON.parse(JSON.stringify(user)) as IUser;
                    assert.equal(userJSON.admin, res.body.docs.admin);
                    assert.equal(userJSON.createdAt, res.body.docs.createdAt);
                    assert.equal(userJSON.customerId, res.body.docs.customerId);
                    assert.equal(userJSON.id, res.body.docs.id);
                    assert.equal(userJSON.login, res.body.docs.login);
                    assert.equal(userJSON.name, res.body.docs.name);
                    assert.equal(userJSON.root, res.body.docs.root);
                    assert.equal(userJSON.type, res.body.docs.type);
                    assert.notEqual(userJSON.updatedAt, res.body.docs.updatedAt);
                })
                .end(done);
        });
    });

    describe("PATCH /settings/profile", () => {
        it("should return 200 `OK` if profile successfully updated", (done) => {
            // Attempt to update all fields
            const data = {
                admin: !user.admin,
                createdAt: new Date(),
                customerId: Faker.random.uuid(),
                id: Faker.random.uuid(),
                login: Faker.internet.email(),
                name: Faker.name.findName(),
                password: Faker.internet.password(),
                root: !user.root,
                updatedAt: new Date(),
            };

            app.patch("/settings/profile")
                .set("authorization", `Bearer ${userToken}`)
                .send(data)
                .expect(200)
                .expect("content-type", /json/)
                .expect((res: any) => {
                    const userJSON = JSON.parse(JSON.stringify(user)) as IUser;
                    // should update permitted fields
                    assert.equal(data.name, res.body.docs.name);
                    assert.notEqual(userJSON.updatedAt, res.body.docs.updatedAt);

                    // should not update other fields
                    assert.equal(userJSON.admin, res.body.docs.admin);
                    assert.equal(userJSON.createdAt, res.body.docs.createdAt);
                    assert.equal(userJSON.customerId, res.body.docs.customerId);
                    assert.equal(userJSON.id, res.body.docs.id);
                    assert.equal(userJSON.login, res.body.docs.login);
                    assert.equal(userJSON.password, res.body.docs.password);
                    assert.equal(userJSON.root, res.body.docs.root);
                })
                .end(done);
        });
    });

    describe("GET /settings/account", () => {
        it("should return 401 `Unauthorized` if current User is not an admin", (done) => {
            app.get("/settings/account")
                .set("authorization", `Bearer ${userToken}`)
                .expect("content-type", /json/)
                .expect(401)
                .end(done);
        });

        it("should return settings for Customer if current User is an admin", (done) => {
            app.get("/settings/account")
                .set("authorization", `Bearer ${adminToken}`)
                .expect(200)
                .expect("content-type", /json/)
                .expect((res: any) => {
                    const customerJSON = JSON.parse(JSON.stringify(customer)) as ICustomer;
                    assert.equal(customerJSON.createdAt, res.body.docs.createdAt);
                    assert.equal(customerJSON.id, res.body.docs.id);
                    assert.equal(customerJSON.name, res.body.docs.name);
                    assert.equal(customerJSON.type, res.body.docs.type);
                    assert.equal(customerJSON.updatedAt, res.body.docs.updatedAt);
                })
                .end(done);
        });
    });

    describe("PATCH /settings/account", () => {
        it("should return 401 `Unauthorized` if current User is not admin", (done) => {
            app.patch("/settings/account")
                .set("authorization", `Bearer ${userToken}`)
                .expect("content-type", /json/)
                .expect(401)
                .end(done);
        });

        it("should return 200 `OK` if account successfully updated", (done) => {
            const data = {
                createdAt: new Date(),
                id: Faker.random.uuid(),
                name: Faker.company.companyName(),
                updatedAt: new Date(),
            };

            app.patch("/settings/account")
                .set("authorization", `Bearer ${adminToken}`)
                .send(data)
                .expect(200)
                .expect("content-type", /json/)
                .expect((res: any) => {
                    const customerJSON = JSON.parse(JSON.stringify(customer)) as ICustomer;

                    // should update permitted fields
                    assert.equal(data.name, res.body.docs.name);
                    assert.notEqual(customerJSON.updatedAt, res.body.docs.updatedAt);

                    // should not update other fields
                    assert.equal(customerJSON.createdAt, res.body.docs.createdAt);
                    assert.equal(customerJSON.id, res.body.docs.id);
                    assert.equal(customerJSON.type, res.body.docs.type);
                })
                .end(done);
        });
    });
});
