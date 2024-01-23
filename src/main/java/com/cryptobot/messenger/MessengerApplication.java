package com.cryptobot.messenger;

import com.cryptobot.messenger.mq.NotificationConsumer;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;

import java.io.IOException;
import java.util.concurrent.TimeoutException;

@SpringBootApplication
public class MessengerApplication {

	public static void main(String[] args) {
		ApplicationContext context = SpringApplication.run(MessengerApplication.class, args);
		NotificationConsumer notificationConsumer = context.getBean(NotificationConsumer.class);

		System.out.println("running consume");

		try {
			notificationConsumer.consume();
		} catch (IOException e) {
			throw new RuntimeException(e);
		} catch (TimeoutException e) {
			throw new RuntimeException(e);
		}

	}

}
