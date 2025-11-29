import { generateAccessToken, verifyRefreshJwtToken } from "../../helper/token";
import asyncHandler from "../../utils/asyncHandler";

import { Request, Response } from "express";
import ApiResponse from "../../utils/ApiResponse";
import { eq } from "drizzle-orm";
import { user } from "../../db/schema";
import { db } from "../../db";
import { passwordHashed } from "../../helper/hasher";
import ApiError from "../../utils/ApiError";

interface User {
  id: string;
  email: string;
  refreshToken: string;
}

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

      // response.redirect(`${process.env.FRONTEND_ENDPOINT_URL}/store`);
    } catch (error) {
      console.log(error);
      response.status(500).json({ error });
    }
    // console.log(prismaUser);
    // const accessToken = generateAccessToken(prismaUser.id);

    // Generate JWT Tokens
  }
);

export const generateRefreshToken = asyncHandler(
  async (request: Request, response: Response) => {
    const refreshToken = request.cookies.refresh_token;

    if (!refreshToken) {
      response.status(403).json({ error: "Refresh token Missing" });
    } else {
      try {
        const decoded = verifyRefreshJwtToken(refreshToken) as User;

        //Find user in DB
        const userData = await db.query.user.findFirst({
          where: eq(user.id, decoded.id),
        });

        if (!userData || userData.refreshToken !== refreshToken) {
          response.status(403).json({ error: "Invalid refresh token" });
        } else {
          // Generate new tokens
          const newAccessToken = generateAccessToken({
            id: userData.id,
            email: userData.email!,
          });
          response.cookie("access_token", newAccessToken, {
            // httpOnly: true,
            secure: true,
            maxAge: 15 * 60 * 1000, // 15 minutes
            sameSite: "none",
          });
          response.status(200).json({ accessToken: newAccessToken });
        }
      } catch {
        response.status(403).json({ error: "Invalid token" });
      }
    }
  }
);

export const loginUser = asyncHandler(
  async (request: Request, response: Response) => {
    const user = request.user as User;
    console.log("Login User api",user)
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
    });

    if (request.user) {
      // Set HTTP-only cookies
      response.cookie("access_token", accessToken, {
        httpOnly: true,
        secure: true,
        maxAge: 15 * 60 * 1000, // 15 minutes
        sameSite: "strict",
      });

      response.cookie("refresh_token", user.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      response.json(
        new ApiResponse(
          200,
          {
            user: user,
            session: request.session,
            token: accessToken,
          },
          "User logged In Successfully"
        )
      );
    } else {
      response.sendStatus(401);
    }
  }
);

export const registerUser = asyncHandler(
  async (request: Request, response: Response) => {
    const { name, email, password, avatar } = request.body;

    try {
      const existedUser = await db.query.user.findFirst({
        where: eq(user.email, email),
      });

      if (existedUser) {
        response
          .status(200)
          .json(new ApiResponse(409, {}, "User already exists"));
      } else {
        const hashedPassword = await passwordHashed(password);
        const [createdUser] = await db
          .insert(user)
          .values({
            name,
            email,
            // password: hashedPassword,
            avatar,
           
          })
          .returning();
        // const token = generateEmailVerifyToken(email);

        // const dataFile = await axios.post(
        // 	`${process.env.EMAIL_SERVICE_URI!}/auth/verify-email`,
        // 	{
        // 		to: email,
        // 		data: {
        // 			userName: firstName,
        // 			verificationLink: `${process.env.FRONTEND_ENDPOINT_URL!}/verify-email?token=${token}`,
        // 		},
        // 	},
        // 	{
        // 		headers: {
        // 			'Content-Type': 'application/json',
        // 		},
        // 	}
        // );

        // console.log('Email dataFile', dataFile);

        response
          .status(200)
          .json(new ApiResponse(200, createdUser, "New User Created"));
      }
    } catch (error) {
      console.log(error);
      response.status(400).json(new ApiError(400, "Error Happens", error));
    }
  }
);
