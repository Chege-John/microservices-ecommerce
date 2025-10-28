import { createConsumer, createProducer, createKafkaClient } from '@repo/kafka';

const kafkaClient = createKafkaClient('payment-service');

export const producer = createProducer(kafkaClient);
export const consumer = createConsumer(kafkaClient, 'payment-group');
