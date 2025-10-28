import type { Consumer, Kafka } from 'kafkajs';

export const createConsumer = (kafka: Kafka, groupId: string) => {
  const consumer: Consumer = kafka.consumer({ groupId });

  const connect = async () => {
    await consumer.connect();
  };

  const subscribe = async (
    topic: string,
    handler: (message: any) => Promise<void>
  ) => {
    await consumer.subscribe({ topic: topic, fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ message, topic, partition }) => {
        try {
          const value = message.value?.toString();

          if (value) {
            await handler(JSON.parse(value));
          }
        } catch (error) {
          console.log('Error processing message:', error);
        }
      },
    });
  };

  const disconnect = async () => {
    await consumer.disconnect();
  };

  return { connect, disconnect, subscribe };
};
