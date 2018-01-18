import * as Express from "express";

const app = Express();

const HOST = "0.0.0.0";
const PORT = 1337;

app.get("/", (req, res) => res.send("Hello World"));

app.listen(PORT, HOST, () => console.log(`Listening on http://${HOST}:${PORT}`));
