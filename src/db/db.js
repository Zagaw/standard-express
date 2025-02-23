import mongoose from "mongoose";

//const dbName = "standard-express";

export const connectDB = async () => {
    try{
        const connectionResponse = await mongoose.connect(`${process.env.MONGO_DB}`);

        console.log("DB Connected Successfully", connectionResponse.connection.host);
    }catch(error){
        console.log("DB connection error", error);
        process.exit(1);
    }
};