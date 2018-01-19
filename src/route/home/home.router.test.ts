import "mocha";
import { join } from "path";
import { testApplication as app } from "../../testrunner";

describe("Home API routes", () => {

    describe("GET /", () => {

        it("should return service metadata", (done) => {
            const metadata = require(join("..", "..", "..", "package.json"));
            app.get("/")
                .expect(200)
                .expect("content-type", /json/)
                .expect({
                    data: {
                        author: metadata.author,
                        description: metadata.description,
                        name: metadata.name,
                        version: metadata.version,
                    },
                })
                .end(done);
        });
    });

    describe("GET /teapot", () => {

        it("should return 418 `I'm a teapot`", (done) => {
            app.get("/teapot")
                .expect(418)
                .expect("content-type", /json/)
                .expect({ message: "I'm a teapot" })
                .end(done);
        });
    });

    describe("GET /error", () => {

        it("should return 500 `Internal Server Error`", (done) => {
            app.get("/error")
                .expect(500)
                .expect("content-type", /json/)
                .expect({ message: "Internal Server Error" })
                .end(done);
        });
    });
});
