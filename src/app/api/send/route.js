import { EmailTemplate } from "../../../components/email/template";
import { VerificationEmailTemplate } from "../../../components/email/verification-template";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
    const body = await request.json();
    try {
        // Determine which template to use based on the content
        const isVerificationEmail = body.subject?.includes("Vérifiez votre adresse email");
        
        const { data, error } = await resend.emails.send({
            from: "PolGPT <noreply@polgpt.be>",
            to: body.email,
            subject: body.subject,
            react: isVerificationEmail 
                ? VerificationEmailTemplate({
                    name: body.name,
                    verificationUrl: body.url,
                })
                : EmailTemplate({
                    name: body.name,
                    message: body.message,
                    url: body.url,
                }),
        });

        if (error) {
            return Response.json({ error }, { status: 500 });
        }

        return Response.json(data);
    } catch (error) {
        return Response.json({ error }, { status: 500 });
    }
}
