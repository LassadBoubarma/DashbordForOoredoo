# ====== Build stage ======
FROM gradle:8-jdk17-alpine AS build
WORKDIR /workspace
# Copy backend project
COPY . .
# Build the bootable jar (frontend is built via Gradle task wiring)
RUN gradle clean bootJar -x test --no-daemon

# ====== Runtime stage ======
FROM eclipse-temurin:17-jre-alpine
ENV JAVA_OPTS="-Xms128m -Xmx512m"
ENV PORT=8080
WORKDIR /app
# Copy the built jar
COPY --from=build /workspace/build/libs/*.jar /app/app.jar
EXPOSE 8080
CMD ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"] 