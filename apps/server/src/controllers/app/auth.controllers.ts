import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshJwtToken,
} from "../../helper/token";
import asyncHandler from "../../utils/asyncHandler";

import { Request, Response } from "express";
import ApiResponse from "../../utils/ApiResponse";

import { user } from "../../db/schema";
import { db } from "../../db";
import { passwordHashed } from "../../helper/hasher";
import ApiError from "../../utils/ApiError";
import { client } from "../../config/googleAuth.config";
import { eq } from "drizzle-orm";
import { generateOTP } from "../../utils/otpGenerator";
import { getSMSProvider } from "../../service/sms/providerFactory";

interface User {
  id: string;
  email: string;
  refreshToken: string;
}

export const appGoogleLogin = asyncHandler(
  async (request: Request, response: Response) => {
    const { idToken } = request.body;

    console.log(idToken);

    if (!idToken) {
      response.status(400).json({ error: "ID token is required" });
    }

    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience:
          process.env.GOOGLE_CLIENT_ID ||
          "452133296020-vnm82pl00uft6md2f6rhe26qf3i2pvm2.apps.googleusercontent.com",
      });

      const payload = ticket.getPayload();

      // if (!payload) {
      //   response.status(400).json({ error: "Invalid ID token" });
      // }

      const googleId = payload?.sub;
      const email = payload?.email;
      const name = payload?.name;
      const avatar = payload?.picture;

      let userData = await db.query.user.findFirst({
        where: eq(user.googleId, googleId!) || eq(user.email, email!),
      });

      if (!userData) {
        [userData] = await db
          .insert(user)
          .values({
            googleId: googleId || " ",
            email: email || "",
            name: name || "",
            avatar: avatar || "",
          })
          .returning();
      }

      const accessToken = await generateAccessToken({
        id: userData.id,
        email: userData.email!,
      });

      response.json(
        new ApiResponse(
          200,
          {
            user: userData,
            session: request.session,
            token: accessToken,
          },
          "User logged In Successfully"
        )
      );
    } catch (error) {
      console.log(error);
      response.status(400).json(new ApiError(400, "Error Happens", error));
    }
  }
);

export const googleCallback = asyncHandler(
  async (request: Request, response: Response) => {
    try {
      const user = request.user as User;
      console.log();

      const accessToken = generateAccessToken({
        id: user.id,
        email: user.email,
      });

      response.cookie("access_token", accessToken, {
        // httpOnly: true,
        secure: true,
        maxAge: 15 * 60 * 1000, // 15 minutes
        sameSite: "none",
      });

      // Set HTTP-only cookies

      response.cookie("refresh_token", user.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      response.redirect(`${process.env.FRONTEND_ENDPOINT_URL}/store`);
    } catch (error) {
      console.log(error);
      response.status(500).json({ error });
    }
    // console.log(prismaUser);
    // const accessToken = generateAccessToken(prismaUser.id);

    // Generate JWT Tokens
  }
);

// export const generateRefreshToken = asyncHandler(
//   async (request: Request, response: Response) => {
//     const refreshToken = request.cookies.refresh_token;

//     if (!refreshToken) {
//       response.status(403).json({ error: "Refresh token Missing" });
//     } else {
//       try {
//         const decoded = verifyRefreshJwtToken(refreshToken) as User;

//         //Find user in DB
//         const userData = await db.query.user.findFirst({
//           where: eq(user.id, decoded.id),
//         });

//         if (!userData || userData.refreshToken !== refreshToken) {
//           response.status(403).json({ error: "Invalid refresh token" });
//         } else {
//           // Generate new tokens
//           const newAccessToken = generateAccessToken({
//             id: userData.id,
//             email: userData.email!,
//           });
//           response.cookie("access_token", newAccessToken, {
//             // httpOnly: true,
//             secure: true,
//             maxAge: 15 * 60 * 1000, // 15 minutes
//             sameSite: "none",
//           });
//           response.status(200).json({ accessToken: newAccessToken });
//         }
//       } catch {
//         response.status(403).json({ error: "Invalid token" });
//       }
//     }
//   }
// );

export const sendSMS = asyncHandler(
  async (request: Request, response: Response) => {
    // TODO: Implement SMS sending logic using the provider factory
    const { mobile, countryCode } = request.body;

    const otp = generateOTP();
    const provider = getSMSProvider();

    await provider.send(`+919674128921`, `Your OTP is ${otp}`);

    await db.insert(user).values({
      phone: "+919674128921",
      otp,
      otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });
    response.status(200).json({ message: "SMS sent successfully" });
  }
);

export const verifySMS = asyncHandler(
  async (request: Request, response: Response) => {
    // TODO: Implement SMS verification logic
    response.status(200).json({ message: "SMS verification endpoint" });
  }
);
