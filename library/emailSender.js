const sgMail = require('@sendgrid/mail')
sgMail.setApiKey("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");

const message = {
    to: 'noeliabentancor1@gmail.com', // Change to your recipient
    from: 'expense@vera.com.uy', // Change to your verified sender
    subject: 'Sending with SendGrid is Fun',
    text: 'and easy to do anywhere, even with Node.js',
    html: '<strong>and easy to do anywhere, even with Node.js</strong>',
}

const sendEmail = async () => {
    sgMail
        .send(message)
        .then((response) => {
            console.log(response[0].statusCode)
            console.log(response[0].headers)
        })
        .catch((error) => {
            console.error(error)
        })
};

module.exports = sendEmail;