import sendMail from './utils/mailer';

const start = async () => {
  try {
    await sendMail({
      email: 'johnirunguchege2000@gmail',
      subject: 'Test Email',
      text: 'This is a test email sent from the email service.',
    });
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

start();
