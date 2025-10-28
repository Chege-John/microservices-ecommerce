import { createConsumer, createProducer, createKafkaClient } from '@repo/kafka';

const kafkaClient = createKafkaClient('product-service');

export const producer = createProducer(kafkaClient);

export const consumer = createConsumer(kafkaClient, 'product-group');
