const sgMail = require('@sendgrid/mail');
const config = require('config');
const emailApiKey = config.get("EMAIL_SERVICE.api_key");
const emailSender = config.get("EMAIL_SERVICE.sender");
const url = config.get("URL_INVITATION")
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

        })
        .catch((error) => {
            console.error(error)
        })
};

module.exports = sendEmail;