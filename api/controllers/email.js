var nodemailer = require('nodemailer');
module.exports = nodemailer.createTransport(process.env.EMAIL_ACCOUNT);