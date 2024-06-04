import express from "express";

const app = express();
app.use(express.json());

import assetRoute from "./routes/assets.routes";
import userRoute from "./routes/users.routes";

app.use("/api/v1/asset", assetRoute);
app.use("/api/v1/user", userRoute);

app.listen(3000);
