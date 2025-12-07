import { desc, eq } from "drizzle-orm";
import { db } from "../../db";
import { series, episode } from "../../db/schema";
import redis from "../../lib/redis";
import ApiError from "../../utils/ApiError";
import ApiResponse from "../../utils/ApiResponse";
import asyncHandler from "../../utils/asyncHandler";
import { Request, Response } from "express";

export const getHomePageData = asyncHandler(
  async (request: Request, response: Response) => {
    // const authUser = request.user   as InferSelectModel<typeof user>;

    try {
      const cacheKey = "home:default";

      // Step 1: Check Redis cache
      const cached = await redis.get(cacheKey);

      if (cached) {
        response
          .status(200)
          .json(new ApiResponse(200, JSON.parse(cached), "Fetch User Details"));
      } else {
        await db.transaction(async (tx) => {
          // Step 2: Fetch hero section (your logic here)
          const hero = await tx.query.series.findMany({
            orderBy: desc(series.views),
            limit: 5,
          });

          //trending Series
          const trendingSeries = await tx.query.series.findMany({
            orderBy: desc(series.views),
            limit: 10,
          });

          //New Releases
          const newReleases = await tx.query.series.findMany({
            orderBy: desc(series.createdAt),
            limit: 10,
          });

          //Latest Episodes
          const latestEpisodes = await tx.query.episode.findMany({
            orderBy: desc(episode.createdAt),
            limit: 12,
          });

          // Step 6: Category-based rails
          const categoryList = await tx.query.category.findMany({});

          const categoryRails = [];

          for (const cat of categoryList) {
            const cachedCategoryKey = `home:category:${cat.id}`;

            // Category-level caching for performance
            let cachedCategory = await redis.get(cachedCategoryKey);

            let seriesInCat;

            if (cachedCategory) {
              seriesInCat = JSON.parse(cachedCategory);
            } else {
              seriesInCat = await tx.query.series.findMany({
                where: eq(series.categoryId, cat.id),
                limit: 10,
              });

              await redis.set(cachedCategoryKey, JSON.stringify(seriesInCat));
            }

            categoryRails.push({
              title: cat.name,
              type: "series",
              items: seriesInCat,
            });
          }
          // Step 7: Build final response
          const homeData = {
            rails: [
              { title: "Trending Now", type: "series", items: trendingSeries },
              { title: "New Releases", type: "series", items: newReleases },
              {
                title: "Latest Episodes",
                type: "episode",
                items: latestEpisodes,
              },
              ...categoryRails,
            ],
          };

          // Step 8: Cache final homepage JSON for 5 minutes
          await redis.set(cacheKey,  JSON.stringify(homeData),"EX",300);

          response.status(200).json(new ApiResponse(200,homeData,"Fetch Home Page Data"))
        });
      }

    } catch (error) {
      response.status(400).json(new ApiError(400, "Error Happened", error));
    }
  }
);
