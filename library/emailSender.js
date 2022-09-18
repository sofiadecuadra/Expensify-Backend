const sgMail = require('@sendgrid/mail');
const config = require('config');
const emailApiKey = config.get("EMAIL_SERVICE.api_key");
const emailSender = config.get("EMAIL_SERVICE.sender");
const url=config.get()
sgMail.setApiKey(emailApiKey);

const getMessage = async (emails, inviteToken) => {
    const message = {
        to: emails,
        from: emailSender,
        subject: 'Invitation to join the family',
        text: 'You have been invited to join the family',
        html: `<strong>Click on the link to join the family: http://localhost:3000/families/${inviteToken}</strong>`,
    };
    return message;
};


const sendEmail = async (emails, inviteToken) => {
    const message = await getMessage(emails, inviteToken);
    sgMail
        .send(message)
        .then((response) => {
           
        })
        .catch((error) => {
            console.error(error)
        })
};

module.exports = sendEmail;