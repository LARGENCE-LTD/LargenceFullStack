import { NextRequest } from "next/server";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { StatusCodes } from "http-status-codes";
import { NextResponse } from "next/server";
import { User } from "@/models/User";
import { connect } from "@/database/config";

export async function GET(request: NextRequest) {
  try {
    await connect();
    const { id } = getDataFromToken(request);
    const user = await User.findById(id).select("-password");
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: StatusCodes.NOT_FOUND }
      );
    }
    return NextResponse.json({ user }, { status: StatusCodes.OK });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
