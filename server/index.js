import express from "express";

const app = express();

app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "server running" });
})

app.listen(5050, () => {
    console.log("Server listening on port 5050");
})
