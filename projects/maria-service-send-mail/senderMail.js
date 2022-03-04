import nodemailer from "nodemailer";

const senderMail = {
  config: {},
  transporter: function () {
    const { host, port, secure, auth } = this.config;
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure, // true for 465, false for other ports
      auth,
    });
    return transporter;
  },
  sendMail: async function (data) {
    const transporter = this.transporter();
    let info = await transporter.sendMail(data);
    return info;
  },
};

export default senderMail;
