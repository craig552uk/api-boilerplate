// Silence logger
process.env.LOG_LEVEL = "fatal";

import * as Faker from "faker";
import "mocha";
import * as mongoose from "mongoose";
import "reflect-metadata";
import * as supertest from "supertest";
import { ApplicationService } from "./lib/application.service";

// DB Connection URL
const randName = Faker.lorem.words().replace(/ /g, "-");
const DBURL = process.env.DBURL || `mongodb://localhost:27017/${randName}`;

// Use native promises in Mongoose
(mongoose as any).Promise = global.Promise;

// Mongo ID Regex
export const reMongoID = /^[a-z0-9]{24}$/;

// Timestamp Regex
export const reTimestamp = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$/;

// Application instance wrapped in SuperTest utilities
export const testApplication = supertest(ApplicationService.getInstance()) as supertest.SuperTest<supertest.Test>;

/**
 * Connect to Mongo DB and drop entire database before running tests
 */
before((done: MochaDone) => {
    mongoose.connect(DBURL)
        .then(() => mongoose.connection.db.dropDatabase())
        .then(() => {
            console.log(`> Connect to MongoDB ${DBURL}\n`);
            done();
        })
        .catch(done);
});

/**
 * Disconnect from Mongo DB once all tests are finished
 */
after((done: MochaDone) => {
    mongoose.disconnect();
    console.log("> Disconnected from MongoDB");
    done();
});
