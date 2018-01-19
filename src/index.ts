import * as Express from "express";
import { argv } from "yargs";

const app = Express();

// Get CLI arguments
const HOST = argv.host || "0.0.0.0";
const PORT = argv.port || 1337;

app.get("/", (req, res) => res.send("Hello World"));

app.listen(PORT, HOST, () => console.log(`Listening on http://${HOST}:${PORT}`));
