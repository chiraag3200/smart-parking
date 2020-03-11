const sgMail = require("@sendgrid/mail");

const sendgridAPIKey =
  "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";

sgMail.setApiKey(sendgridAPIKey);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "chiraagmittal05@gmail.com",
    subject: "Welcome to SMART PARKING",
    text: `${name} ,thanks for joining SMART PARKING. We provide you a convinient way to book a parking slot for your car.`
  });
};

module.exports = {
  sendWelcomeEmail
};
