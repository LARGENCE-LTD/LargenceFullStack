import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export interface TokenPayload {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export const getDataFromToken = (req: NextRequest) => {
  try {
    const token = req.cookies.get("token")?.value || "";
    const decodedData = jwt.verify(
      token,
      process.env.TOKEN_SECRET!
    ) as TokenPayload;
    return decodedData;
  } catch (error: any) {
    throw new Error(error.message || "No token provided");
  }
};
