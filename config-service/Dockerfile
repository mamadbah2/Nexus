FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# 1. Copier le pom.xml parent
COPY pom.xml .

# 2. Copier le dossier du microservice spécifique (on l'appelle 'module' dans l'image)
# Si vous lancez le build depuis la racine, le chemin source est 'config-service'
COPY config-service ./config-service

# 3. Lancer le build en ciblant le module spécifique
# -pl (project list) et -am (also make dependencies)
RUN mvn clean package -DskipTests -pl config-service -am
# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN apk add --no-cache curl

# Le JAR se trouve maintenant dans le dossier target du module
COPY --from=build /app/config-service/target/*.jar app.jar

EXPOSE 8888
ENTRYPOINT ["java", "-jar", "app.jar"]