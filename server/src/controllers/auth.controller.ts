import { Request, Response } from "express";

import bcrypt from "bcryptjs";

import asyncHandler from "../utils/asyncHandler";

import ApiError from "../utils/ApiError";

import {
  createUser,
  findUserByEmail
} from "../services/auth.service";

import {
  generateAccessToken,
  generateRefreshToken
} from "../utils/jwt";
import { prisma } from "../config/db";


export const register = asyncHandler(
  async (
    req: Request,
    res: Response
  ) => {
    const {
      name,
      email,
      password
    } = req.body;

    const existingUser =
      await findUserByEmail(email);

    if (existingUser) {
      throw new ApiError(
        400,
        "User already exists"
      );
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user = await createUser({
      name,
      email,
      password: hashedPassword,
      role: "USER"
    });

    res.status(201).json({
      success: true,
      user
    });
  }
);

export const login = asyncHandler(
  async (
    req: Request,
    res: Response
  ) => {
    const {
      email,
      password
    } = req.body;

    const user =
      await findUserByEmail(email);

    if (!user) {
      throw new ApiError(
        401,
        "Invalid credentials"
      );
    }

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {
      throw new ApiError(
        401,
        "Invalid credentials"
      );
    }

    const accessToken =
      generateAccessToken(
        user.id,
        user.role
      );

    const refreshToken =
      generateRefreshToken(
        user.id
      );

    res.cookie(
      "refreshToken",
      refreshToken,
      {
        httpOnly: true,

        secure: false,

        sameSite: "strict",

        maxAge:
          7 *
          24 *
          60 *
          60 *
          1000
      }
    );

    res.json({
      success: true,

      accessToken,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  }
);

export const logout = asyncHandler(
  async (
    req: Request,
    res: Response
  ) => {
    res.clearCookie(
      "refreshToken"
    );

    res.json({
      success: true,
      message: "Logged out"
    });
  }
);

export const me = asyncHandler(
  async (
    req: Request,
    res: Response
  ) => {
    const user =
      await prisma.user.findUnique({
        where: {
          id: req.user?.id
        },

        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      });

    res.json({
      success: true,
      user
    });
  }
);
