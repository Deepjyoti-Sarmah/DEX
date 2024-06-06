import express from "express";
import cors from "cors";

const app = express();
app.use(express.json());

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

import assetRoute from "./routes/assets.routes";
import userRoute from "./routes/users.routes";

app.use("/api/v1/asset", assetRoute);
app.use("/api/v1/user", userRoute);

app.listen(3000);
