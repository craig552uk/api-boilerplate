import * as assert from "assert";
import * as Faker from "faker";
import "mocha";
import * as JWTService from "../../lib/jwt.service";
import { Customer, ICustomer } from "../../model/customer.model";
import { INotification, Notification } from "../../model/notification.model";
import { IUser, User } from "../../model/user.model";
import { testApplication as app } from "../../testrunner";

const LOGIN = Faker.internet.email();
const PASSWORD = "Passw0rd";

let customer: ICustomer;
let user: IUser;
let userToken: string;
const notifications: INotification[] = [];

describe("Notifications API routes", () => {

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
        }).save() as IUser;

        userToken = user.getJWT();

        let n = 10;
        while (n--) {
            const notification = await new Notification({
                customerId: customer.id,
                message: Faker.lorem.words(),
                userId: user.id,
            }).save() as INotification;
            notifications.push(notification);
        }
    });

    describe("GET /notifications", () => {
        it("should return all notifications for the curent User", (done) => {
            app.get("/notifications")
                .set("authorization", `Bearer ${userToken}`)
                .expect("content-type", /json/)
                .expect(200)
                .expect((res: any) => {
                    let timestamp = new Date();

                    assert.equal(res.body.docs.length, 10);
                    res.body.docs.forEach((n: INotification) => {
                        assert.equal(n.customerId, customer.id);
                        assert.equal(n.userId, user.id);
                        assert.equal(n.type, "Notification");
                        assert.equal(n.class, "INFO");

                        // Notifications shuld be returned newest first
                        assert.ok(new Date(n.updatedAt) < timestamp);
                        timestamp = new Date(n.updatedAt);
                    });
                })
                .end(done);
        });
    });

    describe("POST /notifications", () => {
        it("should return 400 `Bad Request` if message not provided", (done) => {
            const data = {};

            app.post("/notifications")
                .send(data)
                .set("authorization", `Bearer ${userToken}`)
                .expect("content-type", /json/)
                .expect(400)
                .end(done);
        });

        it("should return 400 `Bad Request` if class is not INFO, WARNING or ERROR", (done) => {
            const data = { class: "FOO", message: Faker.lorem.words() };

            app.post("/notifications")
                .send(data)
                .set("authorization", `Bearer ${userToken}`)
                .expect("content-type", /json/)
                .expect(400)
                .end(done);
        });

        it("should create a new Notification for the current User", (done) => {
            const data = { class: "WARNING", message: Faker.lorem.words() };

            app.post("/notifications")
                .send(data)
                .set("authorization", `Bearer ${userToken}`)
                .expect("content-type", /json/)
                .expect(200)
                .expect((res: any) => {
                        assert.equal(res.body.docs.customerId, customer.id);
                        assert.equal(res.body.docs.userId, user.id);
                        assert.equal(res.body.docs.type, "Notification");
                        assert.equal(res.body.docs.class, data.class);
                        assert.equal(res.body.docs.message, data.message);
                })
                .end(done);
        });
    });

    describe("DELETE /notifications/:id", () => {
        it("should return 404 `Not Found` if Notification does not exist", (done) => {
            app.delete("/notifications/000000000000000000000000")
                .set("authorization", `Bearer ${userToken}`)
                .expect("content-type", /json/)
                .expect(404)
                .end(done);
        });

        it("should delete a Notification", (done) => {
            app.delete(`/notifications/${notifications[0]._id}`)
                .set("authorization", `Bearer ${userToken}`)
                .expect("content-type", /json/)
                .expect(200)
                .expect((res: any) => {
                    assert.equal(res.body.docs.customerId, customer.id);
                    assert.equal(res.body.docs.userId, user.id);
                    assert.equal(res.body.docs.type, "Notification");
                    assert.equal(res.body.docs.class, notifications[0].class);
                    assert.equal(res.body.docs.message, notifications[0].message);
                })
                .end(done);
        });
    });
});
