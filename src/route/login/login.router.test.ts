import * as assert from "assert";
import * as Faker from "faker";
import "mocha";
import * as supertest from "supertest";
import * as JWTService from "../../lib/jwt.service";
import { Customer, ICustomer } from "../../model/customer.model";
import { IUser, User } from "../../model/user.model";
import { testApplication as app } from "../../testrunner";

const LOGIN = Faker.internet.email();
const PASSWORD = "Passw0rd";
let customer: ICustomer;
let user: IUser;

describe("Authentication API routes", () => {

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
    });

    describe("GET /login", () => {
        it("should return 400 `Bad Request` if Authorization header not provided", (done) => {
            app.get("/login")
                .expect(400)
                .expect("content-type", /json/)
                .expect({ message: "No authorization header provided" })
                .end(done);
        });

        it("should return 401 `Unauthorized` if bad username provided", (done) => {
            app.get("/login")
                .auth("foobar", PASSWORD)
                .expect(401)
                .expect("content-type", /json/)
                .expect({ message: "Incorrect username or password" })
                .end(done);
        });

        it("should return 401 `Unauthorized` if bad password provided", (done) => {
            app.get("/login")
                .auth(LOGIN, "foobar")
                .expect(401)
                .expect("content-type", /json/)
                .expect({ message: "Incorrect username or password" })
                .end(done);
        });

        xit("should return 401 `Unauthorized` if User is deactivated");

        it("should return JWT if User can authenticate", (done) => {
            app.get("/login")
                .auth(LOGIN, PASSWORD)
                .expect(200)
                .expect("content-type", /json/)
                .expect((res: any) => {
                    assert.ok(JWTService.verify(res.body.token));
                    assert.equal(res.body.type, "jwt");
                })
                .end(done);
        });
    });

    describe("GET /whoami with JWT in Authorization Header", () => {
        it("should return 400 `Bad Request` if JWT not provided", (done) => {
            app.get("/whoami")
                .expect(400)
                .expect("content-type", /json/)
                .expect({ message: "Required JWT authorization token missing" })
                .end(done);
        });

        it("should return User object for authenticated User", async () => {
            const auth = await app.get("/login").auth(LOGIN, PASSWORD) as any;
            const whoami = await app.get("/whoami").set("Authorization", `Bearer ${auth.body.token}`) as any;
            assert.deepEqual(whoami.body.data, JSON.parse(JSON.stringify(user)));
        });
    });

    describe("GET /whoami with JWT in Query String", () => {
        it("should return 400 `Bad Request` if JWT not provided", (done) => {
            app.get("/whoami")
                .expect(400)
                .expect("content-type", /json/)
                .expect({ message: "Required JWT authorization token missing" })
                .end(done);
        });

        it("should return User object for authenticated User", async () => {
            const auth = await app.get("/login").auth(LOGIN, PASSWORD) as any;
            const whoami = await app.get(`/whoami?jwt=${auth.body.token}`) as any;
            assert.deepEqual(whoami.body.data, JSON.parse(JSON.stringify(user)));
        });
    });
});
