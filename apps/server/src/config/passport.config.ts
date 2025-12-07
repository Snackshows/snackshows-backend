import dotenv from "dotenv";
dotenv.config();
import passport from "passport";
import passportJwt from "passport-jwt";
import { comparePassword } from "../helper/hasher";
import passportLocal from "passport-local";
import { generateRefreshToken } from "../helper/token";
import passportOAuth from "passport-google-oauth20";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { user } from "../db/schema/user.schema";
import { Request } from "express";
import { employee } from "../db/schema";

interface GoogleUserProfile {
  id: string;
  displayName: string;
  name: { familyName: string; givenName: string };
  emails: Array<{ value: string; verified: boolean }>;
  photos: Array<{
    value: string;
  }>;
  provider: string;
}

const localStrategy = passportLocal.Strategy;
const JwtStrategy = passportJwt.Strategy;

const OAuth2Strategy = passportOAuth.Strategy;

const accessTokenSecretKey = process.env.ACCESS_TOKEN_SECRET!;

export const initializePassportStrategies = () => {
  /* =====================================================================
	    Employee LOCAL LOGIN (Admin/Web User)
	===================================================================== */
  passport.use(
    "employee-local",
    new localStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        //authentication Logic here
        try {
          console.log("Receive Credentials", email, password);
          const existingEmployee = await db.query.employee.findFirst({
            where: eq(employee.email, email),
          });

          if (!existingEmployee) {
            return done(null, false, { message: "Incorrect email" });
          }

          // // 🚨 If user has Google ID, prevent local login
          // if (userDetails.googleId) {
          // 	return done(null, false, {
          // 		message:
          // 			'This account is registered with Google. Please log in using Google instead.',
          // 		redirectTo: '/use-google-login',
          // 	});
          // }

          console.debug("user Profile Details", existingEmployee);

          const isPasswordMatched = await comparePassword(
            password,
            existingEmployee.password!
          );

          if (isPasswordMatched) {
            ///User is Authenticated
            console.log("Auth Parsed User-->", isPasswordMatched);

            // const refreshToken = generateRefreshToken(existingEmployee.id);

            // const [updatedEmployee] = await db
            //   .update(employee)
            //   .set({
            //     refreshToken,
            //   })
            //   .where(eq(employee.id, existingEmployee.id))
            //   .returning();

            console.log(
              "Fetch User data in Local strategy FNS",
              email,
              password
              // refreshToken
            );
            // return done(null, updatedEmployee);
            return done(null, existingEmployee);
          } else {
            return done(null, false, { message: "Incorrect Password" });
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );
  /* =====================================================================
	    USER LOCAL LOGIN (Admin/Web User)
	===================================================================== */
  passport.use(
    "user-local",
    new localStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        //authentication Logic here
        try {
          console.log("Receive Credentials", email, password);
          const existingUser = await db.query.user.findFirst({
            where: eq(user.email, email),
          });

          if (!existingUser) {
            return done(null, false, { message: "Incorrect email" });
          }

          // // 🚨 If user has Google ID, prevent local login
          // if (userDetails.googleId) {
          // 	return done(null, false, {
          // 		message:
          // 			'This account is registered with Google. Please log in using Google instead.',
          // 		redirectTo: '/use-google-login',
          // 	});
          // }

          console.debug("user Profile Details", existingUser);

          const isPasswordMatched = await comparePassword(
            password,
            existingUser.password!
          );

          if (isPasswordMatched) {
            ///User is Authenticated
            console.log("Auth Parsed User-->", isPasswordMatched);

            const parsedUser = {
              id: existingUser.id,
              email: existingUser.email,
              name: existingUser.name,
              avatar: existingUser.avatar,
            };

            console.log(
              "Fetch User data in Local strategy FNS",
              email,
              password
              // refreshToken
            );
            // return done(null, updatedEmployee);
            return done(null, parsedUser);
          } else {
            return done(null, false, { message: "Incorrect Password" });
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  const cookieExtractor = (req: Request) => {
    let token = null;
    console.log("Cookie Extractor", req.cookies.access_token);
    if (req && req.cookies) {
      token = req.cookies.access_token;
    }
    return token;
  };

  /* =====================================================================
	     GOOGLE LOGIN (OAuth2)
	===================================================================== */
  passport.use(
    new JwtStrategy(
      {
        secretOrKey: accessTokenSecretKey,
        jwtFromRequest: cookieExtractor,
      },
      async function (jwtPayload, done) {
        //authentication Logic here

        console.log("Fetch User data in Local strategy FNS", jwtPayload);
        // try {
        // 	const user = await prisma.user.findUnique({
        // 		where: {
        // 			id: jwtPayload.id,
        // 		},
        // 	});

        // 	return user ? done(null, user) : done(null, false);
        // } catch (error) {
        // 	return done(error, false);
        // }
        return jwtPayload ? done(null, jwtPayload) : done(null, false);
      }
    )
  );

  passport.use(
    new OAuth2Strategy(
      {
        clientID: process.env.OAUTH_CLIENT_ID!,
        clientSecret: process.env.OAUTH_CLIENT_SECRET!,
        callbackURL:
          process.env.OAUTH_CALLBACK_URL ||
          "http://localhost:8000/api/v1/app/auth/google/callback",
      },
      async function (accessToken, refreshToken, profile, done) {
        const userProfile = profile as GoogleUserProfile;
        try {
          let userData = await db.query.user.findFirst({
            where:
              eq(user.googleId, userProfile.id) ||
              eq(user.email, userProfile.emails[0].value),
          });

          if (!userData) {
            [userData] = await db
              .insert(user)
              .values({
                googleId: userProfile.id,
                email: userProfile.emails[0].value,
                name: userProfile.name.givenName,
                // lastName: userProfile.name.familyName,
                avatar: userProfile.photos[0]?.value,
                // emailVerified: true,
              })
              .returning();
          }

          // const refreshToken = await generateRefreshToken(userData.id);

          // const [updatedUser] = await db
          //   .update(user)
          //   .set({
          //     refreshToken,
          //   })
          //   .where(eq(user.id, userData!.id))
          //   .returning();

          // return done(null, updatedUser);
          return done(null, userData);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );

  /* =====================================================================
	     INSTAGRAM LOGIN (OAuth2)
	===================================================================== */
  //   passport.use(
  //     new InstagramStrategy(
  //       {
  //         clientID: process.env.INSTAGRAM_CLIENT_ID!,
  //         clientSecret: process.env.INSTAGRAM_CLIENT_SECRET!,
  //         callbackURL: process.env.INSTAGRAM_CALLBACK_URL!,
  //       },

  //       async (accessToken, refreshToken, profile, done) => {
  //         try {
  //           let instaUser = await db.query.user.findFirst({
  //             where: eq(user.instagramId, profile.id),
  //           });

  //           // Instagram returns NO email → you must ask user later
  //           if (!instaUser) {
  //             [instaUser] = await db
  //               .insert(user)
  //               .values({
  //                 instagramId: profile.id,
  //                 firstName: profile.username,
  //                 avatar: profile.profile_picture,
  //               })
  //               .returning();
  //           }

  //           const newRefresh = generateRefreshToken(instaUser.id);

  //           const [updated] = await db
  //             .update(user)
  //             .set({ refreshToken: newRefresh })
  //             .where(eq(user.id, instaUser.id))
  //             .returning();

  //           return done(null, updated);
  //         } catch (err) {
  //           return done(err);
  //         }
  //       }
  //     )
  //   );
};
