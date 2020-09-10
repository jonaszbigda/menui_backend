import nodemailer from "nodemailer";
import path from "path";
import { MAIL_PASS } from "../config/index.js";
import makeResetPassMessage from "../config/mailTemplateReset.js";
import { newError, generatePasswordResetLink } from "../services/services.js";

const images = path.resolve("images");

async function sendMail(reciever, subject, textMessage, htmlMessage) {
  let transporter = nodemailer.createTransport({
    host: "smtp.dpoczta.pl",
    port: 587,
    secure: false,
    auth: {
      user: "noreply@menui.pl",
      pass: MAIL_PASS,
    },
  });

  let info = await transporter.sendMail({
    from: '"Menui" <noreply@menui.pl>',
    to: reciever,
    subject: subject,
    text: textMessage,
    html: htmlMessage,
    attachments: [
      {
        filename: "logo.svg",
        path: images + "/logo.svg",
        cid: "logo",
      },
    ],
  });
}

export async function resetPassword(email) {
  const resetLink = generatePasswordResetLink(email);
  const message = makeResetPassMessage(resetLink);
  await sendMail(
    email,
    "Menui - Resetowanie hasła",
    message.text,
    message.html
  ).catch((err) => {
    throw newError("Nieznany błąd podczas resetu hasła", 500);
  });
}
