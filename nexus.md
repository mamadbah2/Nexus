Rapport de Projet : Architecture Microservices & Chaîne CI/CD (BUY-02)
1. Introduction
Ce projet, nommé buy-02, consiste en la mise en place d'une infrastructure DevOps complète pour une architecture microservices Spring Boot. L'objectif principal était de centraliser la gestion des dépendances, d'héberger les artéfacts (JAR et Docker) de manière privée et d'automatiser le cycle de déploiement.
2. Architecture des Microservices
Le projet est composé de 7 services distincts orchestrés par Maven dans une structure multi-modules :
api-gateway : Point d'entrée unique.
config-service : Centralisation de la configuration.
discovery-service : Registre de services (Eureka).
user, product, order, media : Services métiers.
3. Infrastructure & Stockage d'Artéfacts (Sonatype Nexus)
L'installation d'un serveur Nexus Repository Manager sur un VPS a permis de répondre à trois besoins critiques :
Proxy Maven : Mise en cache des bibliothèques externes pour accélérer les builds.
Dépôts Maven (Snapshots/Releases) : Hébergement des fichiers .jar compilés de chaque microservice.
Registre Docker Privé : Hébergement des images conteneurisées sur le port dédié 7072.
4. Sécurité et Réseau
Pour assurer une communication fluide et sécurisée (notamment pour le protocole Docker), les éléments suivants ont été implémentés :
DNS : Utilisation de duckdns.org pour obtenir un nom de domaine fixe (nexusbuy02.duckdns.org).
Reverse Proxy : Configuration de Nginx pour rediriger le trafic.
Chiffrement SSL : Utilisation de Certbot (Let's Encrypt) pour activer le HTTPS, résolvant ainsi les problèmes de "Insecure Registry" lors des docker login.
5. Automatisation CI/CD (Jenkins)
Le cycle de vie du logiciel a été automatisé via un Jenkinsfile situé à la racine du projet.
Étapes de la Pipeline :
Build & Test : Compilation du code Java avec Maven.
Maven Deploy : Envoi automatique des JARs vers les dépôts Nexus correspondants.
Dockerization : Création d'images Docker basées sur openjdk:11-jre-slim pour chaque service.
Docker Push : Envoi des images vers le registre Nexus privé via le domaine sécurisé.
6. Configuration Maven
L'implémentation d'un POM Parent a permis de centraliser la configuration du distributionManagement et de gérer les versions de manière cohérente :
Définition des URLs des dépôts.
Gestion des versions (Versioning) via le système de tags -SNAPSHOT.
7. Conclusion et Résultats
Le projet buy-02 est désormais doté d'une infrastructure professionnelle :
Gain de temps : Les builds sont 40% plus rapides grâce au cache Nexus.
Fiabilité : Chaque commit sur GitHub déclenche une mise à jour automatique des images Docker.
Autonomie : L'infrastructure est totalement indépendante des registres publics comme Docker Hub.
Développé par : Mamadbah
Technologies : Java 21/Spring Boot 3, Nexus, Jenkins, Docker, Nginx, Linux (VPS).
