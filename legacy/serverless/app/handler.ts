import dotenv from "dotenv";
import serverless from "serverless-http";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import axios from "axios";

import { supabase } from "./supabase/supabaseClient";

dotenv.config({
  path: ".env",
});

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res, next) => {
  return res.status(200).json({
    message: "Hello from root!",
  });
});

app.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  let data = [];
  if (username.includes("@")) {
    ({ data } = await supabase
      .from("users")
      .select("email, phone")
      .eq("email", username));
  } else {
    ({ data } = await supabase
      .from("users")
      .select("email, phone")
      .eq("username", username));
  }
  if (data.length > 0) {
    if (data[0].email) {
      const { session, error } = await supabase.auth.signIn({
        email: data[0].email,
        password,
      });
      if (!error) {
        return res.status(200).json({
          refreshToken: session.refresh_token,
        });
      }
    } else if (data[0].phone) {
      const { session, error } = await supabase.auth.signIn({
        phone: data[0].phone,
        password,
      });
      if (!error) {
        return res.status(200).json({
          refreshToken: session.refresh_token,
        });
      }
    }
  }
  return res.status(404).json({
    message: "Invalid username or password",
  });
});

app.post("/reset-password", async (req, res, next) => {
  const { phone } = req.body;
  const { error } = await supabase.auth.api.sendMobileOTP(phone);
  if (error) {
    return res.status(400).json({
      message: "Failed to send OTP",
    });
  }
  return res.status(200).json({
    message: "Successfully sent OTP",
  });
});

app.post("/verify", async (req, res, next) => {
  const { phone, token } = req.body;
  const { session, error } = await supabase.auth.verifyOTP({
    phone,
    token,
  });
  const { user } = await supabase.auth.api.getUser(session.access_token);
  if (!error && session && user) {
    return res.status(200).json({
      refreshToken: session.refresh_token,
      userId: user.id,
    });
  }
  return res.status(404).json({
    message: "Invalid confirmation code",
  });
});

app.post("/fail-notification", async (req, res, next) => {
  const { userId } = req.body;

  await supabase
    .from("users")
    .update({
      has_failed_clock_in: true,
    })
    .eq("id", userId);

  await sleep(2000);

  const { data, error } = await supabase
    .from("users")
    .select(
      `
      push_token,
      has_failed_clock_in
    `
    )
    .eq("id", userId);

  if (error) {
    return res.status(400).json({
      message: "Failure",
    });
  }

  if (data) {
    const user = data[0];
    if (user.has_failed_clock_in) {
      // Send push notification
      await sendPushNotification(
        user.push_token,
        "OneCase",
        "Tap here to get back to OneCase or your friends will be notified you failed!"
      );
    }
  }
  return res.status(200).json({
    message: "Success",
  });
});

async function sendPushNotification(
  expoPushToken: string,
  title: string,
  body: string,
  data?: any
) {
  const message: any = {
    to: expoPushToken,
    sound: "default",
    title,
    body,
  };
  if (data) {
    message.data = data;
  }
  try {
    await axios.post(
      "https://exp.host/--/api/v2/push/send",
      JSON.stringify(message),
      {
        headers: {
          Accept: "application/json",
          "Accept-encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error", error.message);
  }
}
app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

module.exports.handler = serverless(app);
