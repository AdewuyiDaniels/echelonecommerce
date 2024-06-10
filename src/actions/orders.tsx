"use server";

import db from "../db/db";
import OrderHistoryEmail from "../email/OrderHistory";
import { Resend } from "resend";
import { z } from "zod";
import React from "react";
import ReactDOMServer from "react-dom/server";

const emailSchema = z.string().email();
const resend = new Resend(process.env.RESEND_API_KEY as string);

export async function emailOrderHistory(
  prevState: unknown,
  formData: FormData
): Promise<{ message?: string; error?: string }> {
  const result = emailSchema.safeParse(formData.get("email"));

  if (!result.success) {
    return { error: "Invalid email address" };
  }

  const user = await db.user.findUnique({
    where: { email: result.data },
    select: {
      email: true,
      orders: {
        select: {
          pricePaidInCents: true,
          id: true,
          createdAt: true,
          product: {
            select: {
              id: true,
              name: true,
              imagePath: true,
              description: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    return {
      message:
        "Check your email to view your order history and download your products.",
    };
  }

  const orders = user.orders;

  const renderedEmail = ReactDOMServer.renderToString(
    <OrderHistoryEmail orders={orders} />
  );

  const data = await resend.emails.send({
    from: `Support <${process.env.SENDER_EMAIL}>`,
    to: user.email,
    subject: "Order History",
    html: renderedEmail, // Send the rendered HTML
  });

  if (data.error) {
    return { error: "There was an error sending your email. Please try again." };
  }

  return {
    message:
      "Check your email to view your order history and download your products.",
  };
}
