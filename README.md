# messenger
A Notification system that acts as a standalone service for CryptoBOT

## Entities
- `Message` extends `QueueEntry`
- `Endpoint` class or interface?

## Notification Pipeline
- Every `Message`must be passed through a pipeline with different `NotificationStage`s
- Each `NotificationStage` is responsible for delivering to its own Platform.
- Once the pipeline is complete -> basicAck() the RabbitMQ to delete the message from Queue. ( What if only one fails? Send to DLQ for single platform tags )



## Webhook
- Must push messages to endpoints
- Ability to add an Endpoint to push
  - Store a collection of `Endpoint`s in MongoDB
  - For each endpoint -> Push out `Message`
