const nodemailer = require("nodemailer");

const sendEmail = async (to) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: "Welcome to Absolute Cinema 🎬",
      text: "Signup successful! Enjoy the platform 🚀",
    };

    await transporter.sendMail(mailOptions);

    console.log("Email sent ✅");
  } catch (error) {
    console.log("Email Error ❌:", error);
    throw error; // IMPORTANT
  }
};

module.exports = sendEmail;