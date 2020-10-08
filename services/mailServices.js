const nodemailer = require("nodemailer");
const path = require("path");
const { MAIL_PASS } = require("../config/index.js");
const makeResetPassMessage = require("../config/mailTemplateReset.js");
const {
  newError,
  generatePasswordResetLink,
} = require("../services/services.js");

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

async function resetPassword(email) {
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

exports.resetPassword = resetPassword;
