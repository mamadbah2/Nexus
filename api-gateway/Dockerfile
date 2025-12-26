FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# 1. Copier le pom.xml parent
COPY pom.xml .

# 2. Copier le dossier du microservice spécifique (on l'appelle 'module' dans l'image)
# Si vous lancez le build depuis la racine, le chemin source est 'api-gateway'
COPY api-gateway ./api-gateway

WORKDIR /app/api-gateway
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN apk add --no-cache curl

# Le JAR se trouve maintenant dans le dossier target du module
COPY --from=build /app/api-gateway/target/*.jar app.jar

EXPOSE 5050
ENTRYPOINT ["java", "-jar", "app.jar"]