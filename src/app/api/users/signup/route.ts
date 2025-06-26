import { StatusCodes, getReasonPhrase } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/database/config';
import { User } from '@/models/User';
import bcryptjs from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connect();

    // Parse request body
    const { firstName, lastName, email, password } = await request.json();

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { message: getReasonPhrase(StatusCodes.BAD_REQUEST) },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { message: getReasonPhrase(StatusCodes.BAD_REQUEST) },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { message: getReasonPhrase(StatusCodes.CONFLICT) },
        { status: StatusCodes.CONFLICT }
      );
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10)
    const hashedPassword = await bcryptjs.hash(password, salt)

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    await user.save();

    // Return success response
    const userResponse = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    };

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: userResponse 
      },
      { status: StatusCodes.OK }
    );

  } catch (error: any) {
    console.error('Signup error:', error);
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: StatusCodes.CONFLICT }
      );
    }

    return NextResponse.json(
      { error: error.message },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
