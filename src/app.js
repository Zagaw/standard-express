import express, {json, urlencoded, static as static_} from "express";
import cors from "cors";
import router from "./routes/test.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.js";

const app = express();

app.use(cors({
    origin: process.env.ORIGIN,
    Credential: true
}
));

app.use(json({limit: "16kb"}));
app.use(urlencoded({extended: true, limit: "16kb"}));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/beta/test", router);
app.use("/api/v1", authRouter);

export {app};