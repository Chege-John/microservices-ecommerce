import type { Kafka, Producer } from 'kafkajs';

export const createProducer = (kafka: Kafka) => {
  const producer: Producer = kafka.producer();

  const connect = async () => {
    await producer.connect();
  };

  const send = async (topic: string, messages: object) => {
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(messages) }],
    });
  };

  const disconnect = async () => {
    await producer.disconnect();
  };

  return { connect, send, disconnect };
};
