import { StatusCodes } from "http-status-codes";
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/config";
import { User } from "@/models/User";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connect();

    // Parse request body
    const { email, password } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { message: "User not found, try creating an account" },
        { status: StatusCodes.UNAUTHORIZED }
      );
    }

    // Verify password
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid email or password, try again" },
        { status: StatusCodes.UNAUTHORIZED }
      );
    }

    const tokenData = {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    // Generate JWT token
    const token = jwt.sign(tokenData, process.env.TOKEN_SECRET!, {
      expiresIn: "2d",
    });

    const response = NextResponse.json(
      {
        message: "Login successful",
        user: tokenData,
        token,
      },
      { status: StatusCodes.OK }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);

    return NextResponse.json(
      { error: error.message },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
