import * as Express from "express";
import { argv } from "yargs";
import { ApplicationService } from "./lib/application.service";
import { LoggerService } from "./lib/logger.service";

// Get CLI arguments
const HOST = argv.host || "0.0.0.0";
const PORT = argv.port || 1337;

// Get Service Instances
const logger = LoggerService.getInstance();
const app = ApplicationService.getInstance();

// Serve Application
app.listen(PORT, HOST, () => logger.info(`Listening on http://${HOST}:${PORT}`));
