import * as Express from "express";
import { argv } from "yargs";
import { LoggerService } from "./lib/logger.service";

const app = Express();

// Get CLI arguments
const HOST = argv.host || "0.0.0.0";
const PORT = argv.port || 1337;

// Get Logger Instance
const logger = LoggerService.getInstance();

app.get("/", (req, res) => res.send("Hello World"));

app.listen(PORT, HOST, () => logger.info(`Listening on http://${HOST}:${PORT}`));
