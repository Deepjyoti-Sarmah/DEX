import express from "express";
import assetRoute from "./routes/assets.routes"

const app = express();
app.use(express.json());

app.use("/api/v1/asset", assetRoute);

app.listen(3000);
