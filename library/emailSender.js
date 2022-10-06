const sgMail = require('@sendgrid/mail');
const dotenv = require("dotenv");
dotenv.config();
const emailApiKey = process.env.EMAIL_SERVICE_API_KEY;
const emailSender = process.env.EMAIL_SERVICE_SENDER;
const url = process.env.URL_INVITATION
sgMail.setApiKey(emailApiKey);

const getMessage = async (emails, inviteToken, family) => {
    const message = {
        to: emails,
        from: emailSender,
        subject: `Invitation to join the family ${family} `,
        text: 'You have been invited to join the family',
        html: `<strong>Click on the link to join the family: ${url}${inviteToken}</strong>`,
    };
    return message;
};


const sendEmail = async (emails, inviteToken, family) => {
    const message = await getMessage(emails, inviteToken, family);
    sgMail
        .send(message)
        .then((response) => {

        });
};

module.exports = sendEmail;