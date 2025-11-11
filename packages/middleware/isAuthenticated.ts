import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "@packages/libs/prisma";

interface DecodedToken {
  id: string;
  role: "user" | "seller";
}

interface AuthenticatedRequest extends Request {
  user?: any;
}

const isAuthenticated = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req.cookies?.access_token || req.headers.authorization?.split(" ")[1];

    if (!token)
      return res.status(401).json({ message: "Unauthorized! Token missing." });

    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as DecodedToken;

    const account = await prisma.users.findUnique({
      where: { id: decoded.id },
    });
    if (!account)
      return res.status(401).json({ message: "Unauthorized! User not found." });

    req.user = account;
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized or token expired." });
  }
};

export default isAuthenticated;
