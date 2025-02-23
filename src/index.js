import { app } from "./app.js";
import dotenv from "dotenv";
import { connectDB } from "./db/db.js";

dotenv.config({
    path: ".env",
});

const PORT = process.env.PORT || 8000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on ${PORT}`);
    });
}).catch((err) => {
    console.log("DB Connection Error", err);
})