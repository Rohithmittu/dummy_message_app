import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import { getServerSession } from "next-auth";

import { User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

export async function POST(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);

  const user: User = session?.user as User;

  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Not Authenticated",
      },
      {
        status: 401,
      }
    );
  }

  const userId = user._id;

  const acceptingMessages = await request.json();

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { isAcceptingMessage: acceptingMessages },
      { new: true }
    );
    if (!updatedUser) {
      return Response.json(
        {
          success: false,
          message: "failed to update user status to accept message",
        },
        {
          status: 401,
        }
      );
    }
    return Response.json(
      {
        success: true,
        message: "Message acceptace status upadated successfully",
        updatedUser,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("failed to update user status to accept message");
    return Response.json(
      {
        success: false,
        message: "failed to update user status to accept message",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);

  const user: User = session?.user as User;

  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Not Authenticated",
      },
      {
        status: 401,
      }
    );
  }

  const userId = user._id;

  try {
    const foundUser = await UserModel.findById(userId);

    if (!foundUser) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json(
      {
        success: true,
        isAcceptingMessages: foundUser.isAcceptingMessage,
      },
      {
        status: 404,
      }
    );
  } catch (error) {
    console.error("Error retrieving message acceptance status:", error);
    return Response.json(
      { success: false, message: "Error retrieving message acceptance status" },
      { status: 500 }
    );
  }
}
