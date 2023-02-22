# messenger
A Notification system that acts as a standalone service for CryptoBOT


## Webhook
- Must push messages to endpoints
- Ability to add an Endpoint to push
- - `Endpoint` class or interface?
  - Store a collection of `Endpoint`s in MongoDB
  - `Message` extends `QueueEntry`
  - For each endpoint -> Push out `Message`
