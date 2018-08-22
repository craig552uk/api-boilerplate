import * as Faker from "faker";
import * as mongoose from "mongoose";
import { argv } from "yargs";
import { ApplicationService } from "./lib/application.service";
import { LoggerService } from "./lib/logger.service";
import { Customer } from "./model/customer.model";
import { User } from "./model/user.model";

// Get CLI arguments
const HOST = argv.host || "0.0.0.0";
const PORT = argv.port || 1337;
const DBURL = argv.DBURL || "mongodb://localhost/local";

// Default Customer & User details
const ROOT_EMAIL = argv.email || "root@featherback.co";
const ROOT_PASSWORD = argv.password || Faker.internet.password(10);
const ROOT_NAME = argv.name || "Root";

// Use native promises in Mongoose
(mongoose as any).Promise = global.Promise;

// Get Logger Instance
const logger = LoggerService.getInstance();

// Connect to MongoDB
mongoose.connect(DBURL)
    .then(async () => {
        logger.info(`Connected to ${DBURL}`);

        // Create Root Customer and User if they do not exist
        if (! await Customer.findOne({ email: ROOT_EMAIL })) {

            logger.info(`Creating Root Customer and User\nUsername: ${ROOT_EMAIL}\nPassword: ${ROOT_PASSWORD}`);

            // Create Root Customer
            const rootCustomer = await new Customer({
                email: ROOT_EMAIL,
                name: ROOT_NAME,
            }).save();

            // Create Root User
            const rootUser = await new User({
                admin: true,
                customerId: rootCustomer._id,
                login: ROOT_EMAIL,
                name: ROOT_NAME,
                password: ROOT_PASSWORD,
                root: true,
            }).save();

            // Generate JWT for Root User
            const jwt = rootUser.getJWT();
            logger.info({ rootCustomer, rootUser }, `Root User JWT: ${jwt}`);
        }

        // Get Application instance
        const app = ApplicationService.getInstance();

        // Serve application
        app.listen(PORT, HOST, () => {
            logger.info(`Listening on http://${HOST}:${PORT}`);
        });
    })
    .catch((err) => {
        logger.error(err);
        mongoose.disconnect();
    });
