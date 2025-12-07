import { generateAccessToken } from "../../helper/token";
import asyncHandler from "../../utils/asyncHandler";

import { Request, Response } from "express";
import ApiResponse from "../../utils/ApiResponse";
import { user } from "../../db/schema";
import { db } from "../../db";
import ApiError from "../../utils/ApiError";
import { client } from "../../config/googleAuth.config";
import { eq } from "drizzle-orm";
import { generateOTP } from "../../utils/otpGenerator";
import { getSMSProvider } from "../../service/sms/providerFactory";
import redis from "../../lib/redis";
import { passwordHashed } from "../../helper/hasher";

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

    const otpKey = `otp:${mobile}`;
    const coolDownKey = `otp:cooldown:${mobile}`;

    const provider = getSMSProvider();

    try {
      // -------- 1. Check cooldown (wait 60 sec before resend) --------
      const coolDown = await redis.ttl(coolDownKey);
      if (coolDown > 0) {
        return response
          .status(429)
          .json(
            new ApiError(
              429,
              `Please wait ${coolDown} seconds before requesting another OTP.`
            )
          );
      }

      // -------- 2. Generate OTP --------
      const otp = generateOTP();

      // -------- 3. Save OTP in Redis (expire in 5 minutes) --------
      await redis.set(otpKey, otp, "EX", 300); // 300 sec = 5 mins

      // -------- 4. Create resend cooldown (60 seconds) --------
      await redis.set(coolDownKey, "1", "EX", 60);

      await redis.set(`otp:${mobile}`, otp); // 5 minutes expiry

      await provider.send(
        `+${countryCode}${mobile}`,
        `Use OTP ${otp} to verify your SnackShows account. Do not share this code with anyone.`
      );

      response
        .status(200)
        .json(new ApiResponse(200, {}, "SMS sent successfully"));
    } catch (error) {
      response.status(400).json(new ApiError(400, "Error Happened", error));
    }
  }
);

export const verifyOtpSms = asyncHandler(
  async (request: Request, response: Response) => {
    // TODO: Implement SMS verification logic
    const { phone, otp } = request.body;

    console.log("Phone:", phone, "OTP:", otp);

    try {
      const otpKey = `otp:${phone}`;
      const attemptsKey = `otp:attempts:${otp}`;

      // ---- 1. Get OTP from redis ----
      const correctOtp = await redis.get(otpKey);
      if (!correctOtp) {
        response
          .status(400)
          .json(new ApiError(400, "OTP expired or not found"));
      }

      // ---- 2. Check maximum attempts ----
      const attempts = parseInt((await redis.get(attemptsKey)) || "0");
      if (attempts >= 5) {
        response
          .status(400)
          .json(new ApiError(400, "Too many failed attempts"));
      }

      // ---- 3. Compare OTP ----
      if (correctOtp !== otp) {
        await redis.incr(attemptsKey);
        await redis.expire(attemptsKey, 300);
        response.status(400).json(new ApiError(400, "Invalid OTP"));
      }

      // ---- 4. OTP matched → Remove keys ----
      await redis.del(otpKey);
      await redis.del(attemptsKey);

      // ---- 5. **DB Logic: Create User if not exists** ----
      let userData = await db.query.user.findFirst({
        where: eq(user.phoneNumber, phone),
      });

      console.log("Found user data:", userData);
      if (!userData) {
        const inserted = await db
          .insert(user)
          .values({ phoneNumber: phone })
          .returning();
        userData = inserted[0];
      }

      const accessToken = generateAccessToken({
        id: userData.id,
        email: userData.email ?? "",
      });

      response.status(200).json(
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
      console.error("Error in verifyOtpSms:", error);
      response.status(400).json(new ApiError(400, "Error Happened", error));
    }
  }
);


export const loginUser = asyncHandler(
  async (request: Request, response: Response) => {
    const user = request.user as User;
    console.log("Login User api", user);
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
    const { name, email, password, avatar} = request.body;

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
            password: hashedPassword,
            avatar,
           
          })
          .returning();

        response
          .status(200)
          .json(new ApiResponse(200, "New User Created"));
      }
    } catch (error) {
      console.log(error);
      response.status(400).json(new ApiError(400, "Error Happens", error));
    }
  }
);
