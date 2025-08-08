import jwt from "jsonwebtoken";
import { Response, Request, NextFunction } from "express";

export default function middleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // const token = req.headers['authorization']?.split(" ")[1];
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.jwt_SECRET as string, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Failed to authenticate token" });
    }
    // Attach user information to the request object
    //@ts-ignore
    req.user = decoded;
    next();
  });
}