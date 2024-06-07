import express from "express"
import cors from "cors";

const app = express();
app.use(express.json());

app.use(cors({
    origin: process.env.cors_origin,
    credentials: true
}));

import assetroute from "./routes/assets.routes";
import userroute from "./routes/users.routes";
import { initRedis } from "./redis/initRedis";

app.use("/api/v1/asset", assetroute);
app.use("/api/v1/user", userroute);

const port = process.env.PORT || 3001;

const start = async () => {
    try {
        await initRedis();
        app.listen(port, () => {
            console.log(`server is running on port ${port}`)
        });
    } catch (error) {
        console.error("failed to start server:", error);
    }
}

start();
