import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.APP_USER,
    pass: process.env.APP_PASS,
  },
});

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [process.env.APP_URL!],
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "STUDENT",
        required: false,
      },
      phone: {
        type: "string",
        required: false,
      },
      status: {
        type: "string",
        defaultValue: "ACTIVE",
        required: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          return {
            data: {
              ...user,
              emailVerified: true,
            },
          };
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: false,
  },
  emailVerification: {
    sendOnSignUp: false,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      try {
        const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;
        const info = await transporter.sendMail({
          from: '"Prisma Blog" <prismablog@gmail.email>',
          to: user.email,
          subject: "Please verify your email address",
          text: "",
          html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>Verify your email</title></head><body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:24px 0;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;"><tr><td style="background:#111827;padding:20px;text-align:center;"><h1 style="margin:0;color:#ffffff;font-size:22px;">Prisma Blog</h1></td></tr><tr><td style="padding:32px;color:#374151;"><h2 style="margin-top:0;color:#111827;">Verify your email address</h2><p style="font-size:15px;line-height:1.6;">Thanks for signing up for <strong>Prisma Blog</strong>. Please confirm your email address by clicking the button below.</p><div style="text-align:center;margin:32px 0;"><a href="${verificationUrl}" style="background:#2563eb;color:#ffffff;padding:14px 28px;text-decoration:none;font-size:15px;border-radius:6px;display:inline-block;">Verify Email</a></div><p style="font-size:14px;line-height:1.6;color:#6b7280;">If the button doesn’t work, copy and paste this link into your browser:</p><p style="word-break:break-all;font-size:13px;color:#2563eb;">${verificationUrl}</p><p style="font-size:14px;color:#6b7280;margin-top:24px;">If you didn’t create an account, you can safely ignore this email.</p></td></tr><tr><td style="background:#f9fafb;padding:16px;text-align:center;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} Prisma Blog. All rights reserved.</td></tr></table></table></body></html>`,
        });
        console.log("Message sent:", info.messageId);
      } catch (err) {
        console.log(err);
        throw new Error("Failed to send verification email");
      }
    },
  },
  socialProviders: {
    google: {
      prompt: "select_account consent",
      accessType: "offline",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});