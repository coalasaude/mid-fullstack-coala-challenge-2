import { Global, Module } from '@nestjs/common';
import { MessageBroker } from './message-broker';
import { RabbitMqMessageBroker } from './rabbit-mq.message-broker';

@Global()
@Module({
  providers: [
    RabbitMqMessageBroker,
    {
      provide: MessageBroker,
      useExisting: RabbitMqMessageBroker,
    },
  ],
  exports: [MessageBroker],
})
export class MessagingModule {}
