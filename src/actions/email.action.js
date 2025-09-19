"use server";

import { EmailTemplate } from "@/components/email/template";
import { VerificationEmailTemplate } from "@/components/email/verification-template";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ email, subject, name, message, url }) {
  try {
    // Determine which template to use based on the content
    const isVerificationEmail = subject?.includes(
      "Vérifiez votre adresse email",
    );

    const { data, error } = await resend.emails.send({
      from: "PolGPT <noreply@polgpt.be>",
      to: email,
      subject: subject,
      react: isVerificationEmail
        ? VerificationEmailTemplate({
            name: name,
            verificationUrl: url,
          })
        : EmailTemplate({
            name: name,
            message: message,
            url: url,
          }),
    });

    if (error) {
      console.error("Resend error:", error);
      throw new Error("Failed to send email");
    }

    return { success: true, data };
  } catch (error) {
    console.error("Email sending error:", error);
    throw new Error("Failed to send email");
  }
}
