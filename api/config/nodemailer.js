/* Nodemailer configuration */
const nodemailer = require('nodemailer');

module.exports = transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'bmikwwpaddsz4vze@ethereal.email', // generated ethereal user
        pass: 'y4SPt7j5fv7eDheWKX' // generated ethereal password
    },
    tls: {
        rejectUnauthorized: false
    }

});