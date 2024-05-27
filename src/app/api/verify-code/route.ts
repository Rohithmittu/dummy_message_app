import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import { z } from "zod";
import { usernameValidation } from "@/schemas/signupSchema";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, code } = await request.json();  // can also be done req.body onece chceck it

    const decodedUsername = decodeURIComponent(username);

    const user = await UserModel.findOne({ username: decodedUsername });

    if (!user) {
      return Response.json(
        { success: false, message: "user not found" },
        {
          status: 500,
        }
      );
    }

    const isCodeValid = user.verifyCode === code;

    const isCodeNotExpored = new Date(user.verifyCodeExpiry) > new Date();

    if (isCodeValid && isCodeNotExpored) {
      user.isVerified = true;
      await user.save();

      return Response.json(
        { success: true, message: "account verifies succesfully" },
        {
          status: 200,
        }
      );
    } else if (!isCodeNotExpored) {
      return Response.json(
        {
          success: false,
          message:
            "Verification code has expired, please sighup again to get a new code ",
        },
        {
          status: 400,
        }
      );
    } else {
      return Response.json(
        { success: false, message: "Incoreect verification code" },
        {
          status: 400,
        }
      );
    }
  } catch (error) {
    console.error("Error checking username", error);

    return Response.json(
      { success: false, message: "error veryfying user" },
      {
        status: 500,
      }
    );
  }
}
