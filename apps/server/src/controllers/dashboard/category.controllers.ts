import { Request, Response } from "express";

import { db } from "../../db";
import { eq } from "drizzle-orm";
import ApiResponse from "../../utils/ApiResponse";
import { category } from "../../db/schema";
import asyncHandler from "../../utils/asyncHandler";
import ApiError from "../../utils/ApiError";

export const createCategory = asyncHandler(
  async (request: Request, response: Response) => {
    const { name, description, isActive } = request.body;

    console.log(request.body);

    try {
      const [createdCategory] = await db
        .insert(category)
        .values({
          name,
          description,
          isActive,
        })
        .returning();
      console.log("Created Category", createdCategory);
      response
        .status(200)
        .json(new ApiResponse(200, createdCategory, "New Category Created"));
    } catch (error) {
      console.error("Error in createCategory:", error);
      response.status(500).json(new ApiError(500, "Error Happens", error));
    }
  }
);

export const getCategories = asyncHandler(
  async (request: Request, response: Response) => {
    try {
      const uniqueId = request.query.uniqueId?.toString();

      console.log("Unique ID", uniqueId);
      if (uniqueId) {
        const categoryDetails = await db.query.category.findFirst({
          where: eq(category.uniqueId, uniqueId),
        });
        response
          .status(200)
          .json(new ApiResponse(200, categoryDetails, "Category fetched"));
      } else {
        const categories = await db.query.category.findMany();
        response
          .status(200)
          .json(new ApiResponse(200, categories, "Categories fetched"));
      }
    } catch (error) {
      response.status(400).json(new ApiError(400, "Error Happened", error));
    }
  }
);

export const updateCategory = asyncHandler(
  async (request: Request, response: Response) => {
    {
      const { uniqueId, name, description, isActive, createdAt, updatedAt } =
        request.body;
      try {
        if (uniqueId) {
          const categories = await db
            .update(category)
            .set({ name, description, isActive, createdAt, updatedAt })
            .where(eq(category.uniqueId, uniqueId))
            .returning();
          response
            .status(200)
            .json(
              new ApiResponse(200, categories, "Category Details is Updated")
            );
        } else {
          response.status(404).json(new ApiResponse(404, "Category Not Found"));
        }
      } catch (error) {
        response.status(400).json(new ApiError(400, "Error Happened", error));
      }
    }
  }
);

export const updateIsActive = asyncHandler(
  async (request: Request, response: Response) => {
    const { uniqueId, isActive } = request.body;
    try {
      if (uniqueId) {
        const categories = await db
          .update(category)
          .set({ isActive })
          .where(eq(category.uniqueId, uniqueId))
          .returning();
        response
          .status(200)
          .json(new ApiResponse(200, categories, "Category is Updated"));
      } else {
        response.status(404).json(new ApiResponse(404, "Category Not Found"));
      }
    } catch (error) {
      response.status(400).json(new ApiError(400, "Error Happened", error));
    }
  }
);

export const deleteCategory = asyncHandler(
  async (request: Request, response: Response) => {
    const id = request.params.id;

    try {
      if (id) {
        const [deletedCategory] = await db
          .delete(category)
          .where(eq(category.id, id))
          .returning();
        response
          .status(200)
          .json(new ApiResponse(200, deletedCategory, "Category is Deleted"));
      } else {
        response
          .status(404)
          .json(new ApiResponse(404, "category id is not valid"));
      }
    } catch (error) {
      response.status(400).json(new ApiError(400, "Error Happened", error));
    }
  }
);
