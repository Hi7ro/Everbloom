# syntax=docker/dockerfile:1
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build
COPY backend/pom.xml ./pom.xml
RUN --mount=type=cache,target=/root/.m2 mvn -B -ntp dependency:go-offline
COPY backend/src ./src
RUN --mount=type=cache,target=/root/.m2 mvn -B -ntp -DskipTests package

FROM eclipse-temurin:21-jre-alpine
RUN apk add --no-cache curl && addgroup -S everbloom && adduser -S -G everbloom everbloom
WORKDIR /app
COPY --from=build /build/target/everbloom-backend-0.1.0-SNAPSHOT.jar /app/everbloom.jar
USER everbloom
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/everbloom.jar"]
