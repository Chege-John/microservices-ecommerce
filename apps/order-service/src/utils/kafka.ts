import { createConsumer, createProducer, createKafkaClient } from '@repo/kafka';

const kafkaClient = createKafkaClient('order-service');

export const producer = createProducer(kafkaClient);

export const consumer = createConsumer(kafkaClient, 'order-group');
