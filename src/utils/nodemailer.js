import nodemailer from 'nodemailer'

const mailOptions = (to, html) => {
  return {
    from: 'PeruScale no reply<peruscale85@gmail.com>',
    subject: 'Recupera tu cuenta',
    html, 
    to : to,
  }
}

export const sendEmail = async (to, html) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "peruscale85@gmail.com",
      pass: "cznd ahlg afmm bfsf",
    },
  });

  return await transporter.sendMail(mailOptions(to, html))
}