import { Request, Response } from "express";
import { db } from "../../db";
import { eq } from "drizzle-orm";
import ApiResponse from "../../utils/ApiResponse";
import { episode, series } from "../../db/schema";
import asyncHandler from "../../utils/asyncHandler";
import ApiError from "../../utils/ApiError";

export const createEpisode = asyncHandler(
  async (request: Request, response: Response) => {
    const {
    seriesId,
    episodeNumber,
    videoImage,
    videoUrl,
    duration,
    coin,
    isLocked,
    releaseDate
} = request.body;

    try {
      const episodeData: any = {
        seriesId,
        episodeNumber,
        videoImage,
        videoUrl,
        duration,
        coin,
        isLocked,
        releaseDate,
      };

      // FIX: Handle empty/null releaseDate safely
      if (!releaseDate || releaseDate === "") {
        episodeData.releaseDate = null;
      } else {
        episodeData.releaseDate = new Date(releaseDate).toISOString();
      }
      
      const [createdEpisode] = await db
        .insert(episode)
        .values(episodeData)
        .returning();

      response
        .status(200)
        .json(new ApiResponse(200, createdEpisode, "New Episode Created"));
    } catch (error) {
      console.error("Error in createEpisode:", error);
      response
        .status(500)
        .json(new ApiError(500, "Error creating episode", error));
    }
  }
);

export const getAllEpisodes = asyncHandler(
  async (request: Request, response: Response) => {
    try {
      const allSeries = await db.query.episode.findMany({
        
        orderBy: (episode, { desc }) => [desc(episode.createdAt)],
      });

      response
        .status(200)
        .json(
          new ApiResponse(
            200,
            allSeries,
            "All video series fetched successfully",
            allSeries.length
          )
        );
    } catch (error) {
      console.error("Error in getAllVideoSeries:", error);
      response
        .status(500)
        .json(new ApiError(500, "Error fetching video series", error));
    }
  }
);

export const getVideoSeriesById = asyncHandler(
  async (request: Request, response: Response) => {
    const { id } = request.params;

    try {
      const videoSeries = await db.query.series.findFirst({
        where: eq(series.id, id),
        with: {
          category: true,
          episodes: true,
        },
      });

      if (!videoSeries) {
        return response
          .status(404)
          .json(new ApiResponse(404, null, "Video series not found"));
      }

      response
        .status(200)
        .json(
          new ApiResponse(200, videoSeries, "Video series fetched successfully")
        );
    } catch (error) {
      console.error("Error in getVideoSeriesById:", error);
      response
        .status(500)
        .json(new ApiError(500, "Error fetching video series", error));
    }
  }
);

export const updateVideoSeries = asyncHandler(
  async (request: Request, response: Response) => {
    const {
      id,
      name,
      description,
      banner,
      thumbnail,
      type,
      maxAdsForFreeView,
      releaseDate,
      isTrending,
      isAutoAnimateBanner,
      isActive,
      categoryId,
    } = request.body;

    try {
      const updateData: any = {};

      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (banner !== undefined) updateData.banner = banner;
      if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
      if (type !== undefined) updateData.type = type;
      if (maxAdsForFreeView !== undefined)
        updateData.maxAdsForFreeView = maxAdsForFreeView;
      if (releaseDate)
        updateData.releaseDate = new Date(releaseDate).toISOString();
      if (isTrending !== undefined) updateData.isTrending = isTrending;
      if (isAutoAnimateBanner !== undefined)
        updateData.isAutoAnimateBanner = isAutoAnimateBanner;
      if (isActive !== undefined) updateData.isActive = isActive;
      if (categoryId !== undefined) updateData.categoryId = categoryId;

      updateData.updatedAt = new Date().toISOString();

      const [updatedSeries] = await db
        .update(series)
        .set(updateData)
        .where(eq(series.id, id))
        .returning();

      if (!updatedSeries) {
        response
          .status(404)
          .json(new ApiResponse(404, null, "Video series not found"));
      } else {
        response
          .status(200)
          .json(
            new ApiResponse(
              200,
              updatedSeries,
              "Video series updated successfully"
            )
          );
      }
    } catch (error) {
      console.error("Error in updateVideoSeries:", error);
      response
        .status(500)
        .json(new ApiError(500, "Error updating video series", error));
    }
  }
);

export const deleteVideoSeries = asyncHandler(
  async (request: Request, response: Response) => {
    const { id } = request.params;

    try {
      const [deletedSeries] = await db
        .delete(series)
        .where(eq(series.id, id))
        .returning();

      if (!deletedSeries) {
        response
          .status(404)
          .json(new ApiResponse(404, null, "Video series not found"));
      } else {
        response
          .status(200)
          .json(
            new ApiResponse(
              200,
              deletedSeries,
              "Video series deleted successfully"
            )
          );
      }
    } catch (error) {
      console.error("Error in deleteVideoSeries:", error);
      response
        .status(500)
        .json(new ApiError(500, "Error deleting video series", error));
    }
  }
);
