FROM openjdk:17.0.1-jdk-slim

WORKDIR /messenger
COPY target/messenger-0.0.1-SNAPSHOT.jar /messenger.jar
EXPOSE 8081

CMD ["java", "-jar", "/messenger.jar"]

