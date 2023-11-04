import {EventEmitter} from "events";


/**
 * The `NotificationEmitter` class is responsible for managing all Notification related events.
 * For instance you want to send a notification to a user that a SYMBOL has hit the trigger,
 * You then utilize the NotificationEmitter class instances to `emit` and `listen` for events.
 */
class NotificationEmitter extends EventEmitter {}

export default NotificationEmitter;