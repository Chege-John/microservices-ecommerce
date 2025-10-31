import sendMail from './utils/mailer';
import { createKafkaClient, createConsumer } from '@repo/kafka';

const kafka = createKafkaClient('email-service');
const consumer = createConsumer(kafka, 'email-service');

const start = async () => {
  try {
    await consumer.connect();

    await consumer.subscribe([
      {
        topicName: 'user.created',
        topicHandler: async (message) => {
          const { email, username } = message.value;

          if (email) {
            await sendMail({
              email,
              subject: 'Welcome to Ecommerce App',
              text: `Hello ${username}, Your account has been created!`,
            });
          }
        },
      },

      {
        topicName: 'order.created',
        topicHandler: async (message) => {
          const { email, amount, status } = message.value;

          if (email) {
            await sendMail({
              email,
              subject: 'Order has been created',
              text: `Hello! Your order: Amount: ${amount / 100}, Status: ${status}!`,
            });
          }
        },
      },
    ]);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

start();
