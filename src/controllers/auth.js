import { uploadFileToCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.js";
import fs from "fs";
import jwt from "jsonwebtoken";

export const registerController = async (req, res) => {
    const {username, email, password} = req.body;

    if( [username, email, password].some((field) => field?.trim() === "")) {
        return res.status(400).json({message: "All fields are required."});
    }

    const profile_photo_path = req.files.profile_photo[0].path;
    const cover_photo_path = req.files.cover_photo[0].path;

    try {
        const existingUser = await User.findOne({
            $or: [{username}, {email}],
        });

        if(existingUser) {
            res.status(409).json({message: "Email or Username is already exists."});
            throw new Error("Email or Username is already exists.");
        }

        let profile_photo = "";
        let cover_photo = "";

        if(profile_photo_path && cover_photo_path){
            profile_photo = await uploadFileToCloudinary(profile_photo_path);
            cover_photo = await uploadFileToCloudinary(cover_photo_path);
        }

        const user = await User.create({
            email,
            username: username.toLowerCase(),
            password,
            profile_photo,
            cover_photo,
        });

        const createUser = await User.findById(user._id).select(
            "-password -refresh_token" 
        );

        if(!createUser) {
            return res.status(500).json({message: "Something went wrong in registration new user."});
        }

        return res.status(200).json({ userInfo: createUser, message: "Registration is success." });

    } catch (error) {
        console.log("Register Error", error);
        fs.unlinkSync(profile_photo);
        fs.unlinkSync(cover_photo);
    }
};

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const existingUser = await User.findById(userId);

        if(!existingUser) {
            return res.status(404).json({message: "No User Found."})
        }

        const accessToken = await existingUser.generateAccessToken();
        const refreshToken = await existingUser.generateRefreshToken();

        existingUser.refresh_token = refreshToken;
        await existingUser.save({validateBeforeSave: false});

        return {accessToken, refreshToken};

    } catch (error) {
        console.log("Generate Token Error",error);
        return res.status(500).json({message: "Something went wrong."})
    }
}

export const loginController = async (req, res) => {
    const { username, email, password } = req.body;

    if(!username || !email || !password){
        return res.status(400).json({message: "All fields are required."});
    }

    const existingUser = await User.findOne({
        $or: [{username}, {email}],
    });

    if(!existingUser) {
        return res.status(404).json({message: "No user found."});
    }

    const isPassMatch = await existingUser.isPasswordMatch(password);

    if(!isPassMatch) {
        return res.status(401).json({message: "Invalid Credentials."}) 
    }

    const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(existingUser._id);

    const loggedUser = await User.findById(existingUser._id).select("-password -refresh_token");

    const option = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    return res.status(200).cookie("accessToken", accessToken, option).cookie("refreshToken", refreshToken, option).json({User: loggedUser, message: "Login Success."})
};

export const generateNewRefreshToken = async (req, res)=> {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken) {
        return res.status(401).json({message: "No Refresh Token."})
    }

    try {
        const decodeToken = jwt.verify(incomingRefreshToken, process.env.REFRESHTOKEN_SECRET_KEY);

        const existingUser = await User.findById(decodeToken?._id);
        if(!existingUser) {
            return res.status(404).json({message: "No User Found."});
        }

        if(incomingRefreshToken !== existingUser.refresh_token) {
            return res.status(401).json({message: "Invalid Refresh Token."});
        }

        const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(existingUser._id);

        const option = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        }
    
        return res.status(200).cookie("accessToken", accessToken, option).cookie("refreshToken", refreshToken, option).json({message: "Token Updated."})
    } catch (error) {
        console.log("New Refresh Token Error",error);
        return res.status(500).json({message: "Something Went Wrong."})
    }
};

export const logoutController = async (req, res) => {
    if(!req.user || !req.user._id) {
        return res.status(400).json({message: "Logout Unauthorized."});
    }

    try {
        await User.findByIdAndUpdate(req.user._id,
            {
                $unset: {
                    refresh_token : 1,
                },
            },
            {new: true}
        );

        const existingUser = await User.findById(req.user._id);
        console.log(existingUser);

        const option = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        }

        return res.status(200).clearCookie("accessToken", option).clearCookie("refreshToken", option).json({message: `${req.user.username} logout successfully.`});
    } catch (error) {
        console.log("Logout Error :" , error);
        return res.status(500).json({message: "Something went wrong."})
    }
};