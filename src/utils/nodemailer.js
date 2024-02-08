import nodemailer from 'nodemailer'


export const sendEmail = async (to, html, subject) => {

  const mailOptions = (to, html, subject) => {
    return {
      from: 'PeruScale no reply<peruscale85@gmail.com>',
      subject: subject ?? 'Recupera tu cuenta',
      html, 
      to : to,
    }
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "peruscale85@gmail.com",
      pass: "cznd ahlg afmm bfsf",
    },
  });

  return await transporter.sendMail(mailOptions(to, html, subject))
}