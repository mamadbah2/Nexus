#!/bin/bash

# generate_keys.sh
# Ce script automatise la génération d'une paire de clés RSA (privée et publique)
# et formate la clé privée au format PKCS#8.
# Ces clés sont couramment utilisées pour la signature et la vérification de JWT.

# --- Configuration ---
# Nom du fichier pour la clé privée originale (non PKCS#8)
KEYPAIR_FILE="keypair.pem"
# Nom du fichier pour la clé publique
PUBLIC_KEY_FILE="public.pem"
# Nom du fichier pour la clé privée au format PKCS#8 (sans chiffrement)
PRIVATE_KEY_FILE="private.pem"
# Taille de la clé RSA en bits (2048 est une taille courante et sécurisée)
KEY_SIZE=2048

echo "--- Démarrage de la génération des clés ---"

# 1. Générer la clé privée RSA originale
#    - genrsa : Commande pour générer une clé RSA.
#    - -out ${KEYPAIR_FILE} : Spécifie le nom du fichier de sortie pour la clé privée.
#    - ${KEY_SIZE} : Taille de la clé en bits.
echo "1. Génération de la clé privée RSA originale (${KEY_SIZE} bits) -> ${KEYPAIR_FILE}"
openssl genrsa -out "${KEYPAIR_FILE}" "${KEY_SIZE}"
if [ $? -ne 0 ]; then
    echo "Erreur lors de la génération de la clé privée RSA. Abandon."
    exit 1
fi
echo "Clé privée RSA originale générée : ${KEYPAIR_FILE}"

# 2. Extraire la clé publique de la clé privée originale
#    - rsa : Commande pour manipuler les clés RSA.
#    - -in ${KEYPAIR_FILE} : Fichier d'entrée contenant la clé privée.
#    - -pubout : Option pour extraire la clé publique.
#    - -out ${PUBLIC_KEY_FILE} : Fichier de sortie pour la clé publique.
echo "2. Extraction de la clé publique -> ${PUBLIC_KEY_FILE}"
openssl rsa -in "${KEYPAIR_FILE}" -pubout -out "${PUBLIC_KEY_FILE}"
if [ $? -ne 0 ]; then
    echo "Erreur lors de l'extraction de la clé publique. Abandon."
    exit 1
fi
echo "Clé publique extraite : ${PUBLIC_KEY_FILE}"

# 3. Reformater la clé privée au format PKCS#8 (non chiffrée)
#    - pkcs8 : Commande pour manipuler le format PKCS#8.
#    - -topk8 : Convertit la clé vers le format PKCS#8.
#    - -inform PEM : Spécifie que le format d'entrée est PEM.
#    - -nocrypt : IMPORTANT : Ne chiffre PAS la clé privée avec un mot de passe.
#      Utile pour les environnements de développement ou lorsque le chiffrement est géré par l'application.
#      Pour la production, il est souvent préférable de chiffrer la clé et de gérer la passphrase de manière sécurisée.
#    - -in ${KEYPAIR_FILE} : Fichier d'entrée (clé privée originale).
#    - -out ${PRIVATE_KEY_FILE} : Fichier de sortie pour la clé privée PKCS#8.
echo "3. Reformatage de la clé privée au format PKCS#8 (non chiffrée) -> ${PRIVATE_KEY_FILE}"
openssl pkcs8 -topk8 -inform PEM -nocrypt -in "${KEYPAIR_FILE}" -out "${PRIVATE_KEY_FILE}"
if [ $? -ne 0 ]; then
    echo "Erreur lors du reformatage de la clé privée en PKCS#8. Abandon."
    exit 1
fi
echo "Clé privée au format PKCS#8 générée : ${PRIVATE_KEY_FILE}"

echo "--- Processus terminé avec succès ---"
echo "Fichiers générés :"
echo "- Clé privée originale (RSA) : ${KEYPAIR_FILE}"
echo "- Clé publique (PEM) : ${PUBLIC_KEY_FILE}"
echo "- Clé privée (PKCS#8 non chiffrée) : ${PRIVATE_KEY_FILE}"

# Nettoyage (optionnel) : Supprime le fichier keypair.pem si tu n'en as plus besoin.
# echo "Nettoyage : Suppression du fichier temporaire ${KEYPAIR_FILE}"
# rm "${KEYPAIR_FILE}"