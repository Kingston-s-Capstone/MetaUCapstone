const nodemailer = require("nodemailer");
require("dotenv").config();

const sendEmail = async ({ to, subject, html }) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS,
            }
        });

        //email content
        const mailOptions = {
            from: `"UpliftED <${process.env.GMAIL_USER}>`,
            to,
            subject,
            html
        };

        //send email
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}: ${info.response}`);
        return { success: true };
    } catch (error) {
        console.error(`Failed to send email to ${to}:`, error);
        return { success: false, error };
    }
}

module.exports  = sendEmail;