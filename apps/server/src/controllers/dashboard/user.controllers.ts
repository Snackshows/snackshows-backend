import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import ApiError from "../../utils/ApiError";
import { db } from "../../db";
import { eq, InferSelectModel } from "drizzle-orm";
import ApiResponse from "../../utils/ApiResponse";
import { passwordHashed } from "../../helper/hasher";
import { user } from "../../db/schema";
import {
  generateResetPasswordToken,
  verifyResetPasswordJwtToken,
} from "../../helper/token";

export const getAllUsers = asyncHandler(
  async (request: Request, response: Response) => {
    // const authUser = request.user   as InferSelectModel<typeof user>;

    try {
      const userprofile = await db.query.user.findMany();

      response
        .status(200)
        .json(new ApiResponse(200, userprofile, "Fetch All Users"));
    } catch (error) {
      response.status(400).json(new ApiError(400, "Error Happened", error));
    }
  }
);

export const createNewUser = asyncHandler(
  async (request: Request, response: Response) => {
    const { name, age, gender, avatar, phone } = request.body;

    const userGender = gender.toLowerCase();

    const isValidGender =
      userGender === "male"
        ? "male"
        : userGender === "female"
          ? "female"
          : userGender === "other"
            ? "other"
            : null;

    try {
      const findUser = await db.query.user.findFirst({
        where: eq(user.phoneNumber, phone),
      });

      if (findUser) {
        response
          .status(409)
          .json(new ApiResponse(409, null, "User already exists"));
      } else {
        const createdUser = await db.insert(user).values({
          name,
          age,
          gender: isValidGender,
          avatar,
          phoneNumber: phone,
        });

        response
          .status(200)
          .json(new ApiResponse(200, createdUser, "User is Registered"));
      }
    } catch (error) {
      response.status(400).json(new ApiError(400, "Error Happened", error));
    }
  }
);

export const getUserDetails = asyncHandler(
  async (request: Request, response: Response) => {
    const { userId } = request.params;

    try {
      const userprofile = await db.query.user.findFirst({
        where: eq(user.id, userId),
      });

      if (!userprofile) {
        response
          .status(404)
          .json(new ApiResponse(404, null, "User not found"));
      }

      response
        .status(200)
        .json(new ApiResponse(200, userprofile, "Fetch User Details"));
    } catch (error) {
      response.status(400).json(new ApiError(400, "Error Happened", error));
    }
  }
);

// export const userProfile = asyncHandler(
//   async (request: Request, response: Response) => {
//     const authUser = request.user as InferSelectModel<typeof user>;

//     try {
//       const userprofile = await db.query.user.findFirst({
//         where: eq(user.id, authUser.id),
//         columns: {
//           password: false,
//           refreshToken: false,
//         },
//       });

//       response
//         .status(200)
//         .json(new ApiResponse(200, userprofile, "Fetch User Details"));
//     } catch (error) {
//       response.status(400).json(new ApiError(400, "Error Happened", error));
//     }
//   }
// );

// export const updateUserProfile = asyncHandler(
//   async (request: Request, response: Response) => {
//     const authUser = request.user as InferSelectModel<typeof user>;

//     const { name, email, avatar, gender, age, phone } = request.body;

//     try {
//       const userProfile = await db
//         .update(user)
//         .set({
//           name,
//           email,
//           avatar,
//           gender,
//           age,
//           phone,
//         })
//         .where(eq(user.id, authUser.id))
//         .returning();

//       response
//         .status(200)
//         .json(new ApiResponse(200, userProfile[0], "Profile is Updated"));
//     } catch (error) {
//       response.status(400).json(new ApiError(400, "Error Happened", error));
//     }
//   }
// );

// export const updateUserSecurity = asyncHandler(
//   async (request: Request, response: Response) => {
//     const authUser = request.user as InferSelectModel<typeof user>;

//     const { password } = request.body;

//     try {
//       const hashedPassword = await passwordHashed(password);

//       console.log("Hashed Password", hashedPassword);
//       const userSecurity = await db
//         .update(user)
//         .set({
//           password: hashedPassword,
//         })
//         .where(eq(user.id, authUser.id))
//         .returning();

//       response
//         .status(200)
//         .json(
//           new ApiResponse(200, userSecurity[0], "Security Details is Updated")
//         );
//     } catch (error) {
//       response.status(400).json(new ApiError(400, "Error Happened", error));
//     }
//   }
// );

// export const deleteUserProfile = asyncHandler(
//   async (request: Request, response: Response) => {
//     const authUser = request.user as InferSelectModel<typeof user>;

//     try {
//       await db.delete(user).where(eq(user.id, authUser.id));
//       response
//         .status(200)
//         .json(new ApiResponse(200, user, "Profile is Updated"));
//     } catch (error) {
//       response.status(400).json(new ApiError(400, "Error Happened", error));
//     }
//   }
// );

// // Users settings
// export const getUserSettings = asyncHandler(
//   async (request: Request, response: Response) => {
//     const authUser = request.user as InferSelectModel<typeof user>;

//     try {
//       const userSettings = await db.query.user.findFirst({
//         where: eq(user.id, authUser.id),
//       });

//       response.json(
//         new ApiResponse(200, userSettings, "User Account Settings fetched")
//       );
//     } catch (error) {
//       response.status(400).json(new ApiError(400, "Error Happened", error));
//     }
//   }
// );

// export const updateUserSettings = asyncHandler(
//   async (request: Request, response: Response) => {
//     const authUser = request.user as InferSelectModel<typeof user>;

//     const { email, password, avatar, gender, age, phone } = request.body;

//     try {
//       const userSettings = await db
//         .update(user)
//         .set({
//           email,
//           password,
//           avatar,
//           gender,
//           age,
//           phone,
//         })
//         .where(eq(user.id, authUser.id))
//         .returning();

//       response.json(
//         new ApiResponse(200, userSettings[0], "Update User Settings")
//       );
//     } catch (error) {
//       response.status(400).json(new ApiError(400, "Error Happened", error));
//     }
//   }
// );

// // Users notifications
// export const getUserNotification = asyncHandler(
//   async (request: Request, response: Response) => {
//     const authUser = request.user as InferSelectModel<typeof user>;

//     const { email, password, avatar, gender, age, phone } = request.body;

//     try {
//       const userSettings = await db
//         .update(user)
//         .set({
//           email,
//           password,
//           avatar,
//           gender,
//           age,
//           phone,
//         })
//         .where(eq(user.id, authUser.id))
//         .returning();

//       response.json(
//         new ApiResponse(200, userSettings[0], "Update User Settings")
//       );
//     } catch (error) {
//       response.status(400).json(new ApiError(400, "Error Happened", error));
//     }
//   }
// );

// //Forget Password
export const forgetPassword = asyncHandler(
  async (request: Request, response: Response) => {
    const { email } = request.body;

    if (!email) {
      response.status(400).json({ error: "Please Enter field" });
    }

    try {
      const userProfile = await db.query.user.findFirst({
        where: eq(user.email, email),
      });

      if (!userProfile) {
        response.status(400).json({ error: "Email is not registered" });
      } else {
        // console.log("User Profile", userProfile);
        const token = generateResetPasswordToken(userProfile.id);
        console.log("Token", token);

        // const emailInfo = await forgotPasswordEmail({
        // 	receiverEmail: email,
        // 	userFirstName: userProfile.firstName,
        // 	token,
        // });

        response
          .status(200)
          .json(new ApiResponse(200, {}, "New Password Updated"));
      }
    } catch (error) {
      response.status(400).json(new ApiError(400, "error Happens", error));
    }
  }
);

// //Reset Password Link
// export const resetLink = asyncHandler(
//   async (request: Request, response: Response) => {
//     const { token, confirmPassword, newPassword } = request.body;

//     if (confirmPassword !== newPassword && !token) {
//       response.status(400).json({
//         error: "Confirm and New password is not matched or token is getting.",
//       });
//     }

//     if (typeof newPassword === "string") {
//       const { id } = (await verifyResetPasswordJwtToken(token)) as {
//         id: string;
//       };

//       try {
//         const userProfile = await db
//           .update(user)
//           .set({
//             password: await passwordHashed(newPassword),
//           })
//           .where(eq(user.id, id))
//           .returning();

//         response
//           .status(200)
//           .json(new ApiResponse(200, userProfile[0], "New Password Updated"));
//       } catch (error) {
//         console.log(error);
//         response
//           .status(400)
//           .json(new ApiError(400, "Password not Updated", error));
//       }
//     } else {
//       response
//         .status(400)
//         .json(new ApiError(400, "Please give only string value"));
//     }
//   }
// );

// //Logout
// export const logoutUser = asyncHandler(
//   async (request: Request, response: Response) => {
//     request.logout(async (err) => {
//       if (err) {
//         response.status(500).json({ message: "Logout failed" });
//       }

//       const token = request.cookies.refresh_token;

//       console.log("Logout, Refresh Token--->", token);
//       try {
//         await db
//           .update(user)
//           .set({ refreshToken: null })
//           .where(eq(user.refreshToken, token));

//         response.clearCookie("access_token", {
//           // httpOnly: true,
//           secure: process.env.NODE_ENV === "production", // Secure in production
//           sameSite: "strict",
//           path: "/",
//         });
//         response.clearCookie("refresh_token", {
//           httpOnly: true,
//           secure: process.env.NODE_ENV === "production", // Secure in production
//           sameSite: "strict",
//           path: "/",
//         });
//         response.status(200).json({ message: "Logged out successfully" });
//       } catch {
//         response.status(500).json({ error: "Server error" });
//       }
//     });
//   }
// );
