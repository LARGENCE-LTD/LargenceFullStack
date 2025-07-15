import { NextRequest, NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "No token provided" },
        { status: StatusCodes.UNAUTHORIZED }
      );
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify the token
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET!);
    
    return NextResponse.json(
      { message: "Token is valid", user: decoded },
      { status: StatusCodes.OK }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Invalid token" },
      { status: StatusCodes.UNAUTHORIZED }
    );
  }
} 