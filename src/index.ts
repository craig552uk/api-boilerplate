import * as mongoose from "mongoose";
import { argv } from "yargs";
import { ApplicationService } from "./lib/application.service";
import { LoggerService } from "./lib/logger.service";

// Get CLI arguments
const HOST = argv.host || "0.0.0.0";
const PORT = argv.port || 1337;
const DBURL = argv.DBURL || "mongodb://localhost/local";

// Use native promises in Mongoose
(mongoose as any).Promise = global.Promise;

// Get Logger Instance
const logger = LoggerService.getInstance();

// Connect to MongoDB
mongoose.connect(DBURL)
    .then(() => {
        logger.info(`Connected to ${DBURL}`);

        // Get Application instance
        const app = ApplicationService.getInstance();

        // Serve application
        app.listen(PORT, HOST, () => {
            logger.info(`Listening on http://${HOST}:${PORT}`);
        });
    })
    .catch((err) => logger.error(err));
