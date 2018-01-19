// Silence logger
process.env.LOG_LEVEL = "fatal";

import "mocha";
import * as mongoose from "mongoose";
import "reflect-metadata";
import * as supertest from "supertest";
import { ApplicationService } from "./lib/application.service";

// DB Connection URL
const DBURL = process.env.DBURL || "mongodb://localhost:27017/testrunner";

// Use native promises in Mongoose
(mongoose as any).Promise = global.Promise;

// Mongo ID Regex
export const reMongoID = /^[a-z0-9]{24}$/;

// Timestamp Regex
export const reTimestamp = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$/;

// Application instance wrapped in SuperTest utilities
export const testApplication = supertest(ApplicationService.getInstance()) as supertest.SuperTest<supertest.Test>;

/**
 * Connect to Mongo DB and drop entire database
 * @param done Mocha "done" callback
 */
export function dbConnect(done: MochaDone) {
    mongoose.connect(DBURL)
        .then(() => mongoose.connection.db.dropDatabase())
        .then(() => done())
        .catch(done);
}

/**
 * Disconnect form Mongo DB
 * @param done Mocha "done" callback
 */
export function dbDisconnect(done: MochaDone) {
    mongoose.disconnect();
    done();
}
