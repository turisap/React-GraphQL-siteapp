const nodeMailer = require("nodemailer");

const transport = nodeMailer.createTransport({
    host : process.env.MAIL_HOST,
    port : process.env.MAIL_PORT,
    auth : {
        user : process.env.MAIL_USER,
        pass : process.env.MAIL_PASS
    }
});


exports.transport = transport;