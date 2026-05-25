import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
//seperate method to generate access and refresh token becozzz its done frequently

const generateAccessAndRefereshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken() 

        user.refreshToken = refreshToken //saving rT to database

        await user.save({ validateBeforeSave : false }) //saves it {but password is required so we turn off the validation for this}

        return {accessToken, refreshToken};

    } catch (error) {
        throw new ApiError(500, "Error when generating token")
    }
} 

const registerUser = asyncHandler(async (req, res) => {
    const { fullname, email, username, password } = req.body;

    if ([fullname, email, username, password].some((field) => !field || field.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = coverImageLocalPath
        ? await uploadOnCloudinary(coverImageLocalPath)
        : null;

    if (!avatar) {
        throw new ApiError(400, "Avatar upload failed");
    }

    const user = await User.create({
        fullname,
        avatar: avatar.secure_url,
        coverImage: coverImage?.secure_url || "",
        email,
        password,
        username: username.toLowerCase()
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user");
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});

const loginUser = asyncHandler( async(req,res) => {

    //req body
    //username or email
    //find the user 
    //if user,  check the password
    //access and refresh token 
    //send cookies
    //send res -> successfully logged in 

    const {email, username, password} = req.body
    console.log(email);

    if( !username && !email ) {
        throw new ApiError(400, "username and password is required");
        }
    
    
    const user = await User.findOne( { 
        $or: [ {username}, {email}]
    } )

    if (!user) {
        throw new ApiError(404, "User doesnot Exist");

    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid User Credentials");

    }


    const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    //cookies
    //allows only modification through server - no frontend
    const option = {
        httpOnly : true,
        secure : true

    }

    return res
    .status(200).cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
        new ApiResponse(200,
            {
                user : loggedInUser, accessToken, refreshToken
            },
            "user Logged In Successfully"
        )
    )


})


const logoutUser = asyncHandler(async(req,res) =>
{
    //remove the cookie and refresh token from the database
   
    
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {refreshToken : undefined}
        },
        {
            new: true
        }
    )
    
    const options = {
        httpOnly : true,
        secure : true
    }

    return res.status(200)
    .clearCookie("accessToken", options).
    clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out"))


})

const refreshAccessToken = asyncHandler( async(req,res) =>
{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken 

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized Request");
    }

    // verify the token 
    //incoming token -> decodedToken        
    try {
        const decodedToken = jwt.verify( incomingRefreshToken , env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id)    
    
        if(!user){
            throw new ApiError(401 , "Invalid Refresh Token");
        }
    
        // match the incomingRefreshToken with the stored Refresh Toklen
    
        if(incomingRefreshToken != user?.refreshToken) {
            throw new ApiError(401, "Refresh Token is Expired or Used");
    
        }
    
        // all the verification is complete. Now just generate new token
    
        const options = {
            httpOnly : true,
            secure : true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(200, 
                {
                    accessToken, refreshToken : newRefreshToken
                },
                "Access Token Refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token")
    }
})

const changeCurrentPassword = asyncHandler( async(req,res) =>
{
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id);

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect)
    {
        throw new ApiError(400, "Invlaid Old Password");
    }

    user.password = newPassword;

    await user.save({validateBeforeSave : false})

    return res.status(200)
    .json( new ApiResponse(200, {}, "Password Changed Successfully"))



})

const getCurrentUser = asyncHandler( async(req,res) => {
    return res.status(200).json(200, req.user, "current user fetched successfully");
})

const updateAccountDetails = asyncHandler( async (req,res) => {
        const {fullname, email} = req.body

        if( !fullname || !email){
            throw new ApiError(400, "All fields are required");

        }

        const user = User.findByIdAndUpdate(req.user?._id
            , {
                $set : {
                    fullname,
                    email,
                    
                }
            } , {new : true}
        ).select("-password")

        return res.status(200).json(new ApiResponse(200, user, "Account Details Uploaded Successfully"));
})


const updateUserAvatar = asyncHandler( async(req,res) => {

    const avatarLocalPath =  req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is missing");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if(!(avatar.url)) {
        throw new ApiError(400, "Error while Uploading on avatar");
    }

    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                avatar : avatar.url
            }
        },
        {
            new : true
        }
    ).select("-password")

})

const updateUserCoverImage = asyncHandler( async(req, res) =>{

        const coverImageLocalPath = req.files?.path

        if(!coverImageLocalPath)
        {
            throw new ApiError(400, "Cover file is missing");

        }

        const coverImage = await uploadOnCloudinary(coverImageLocalPath);

        if(!coverImage.url)
        {
            throw new ApiError(400, "Error when uploading cover Image");

        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set : {
                    coverImage : coverImage.url
                }
            },

            {
                new : true
            }
        ).select("-password")

        return res.status(200).json(new ApiResponse(200, user, "Cover Image Updated Successfully"))




})


export { registerUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser, 
    updateUserAvatar,
    updateUserCoverImage};