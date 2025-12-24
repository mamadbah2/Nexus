package sn.dev.user_service.web.dto.requests;

import jakarta.validation.constraints.Email;
import lombok.Data;
import lombok.AllArgsConstructor;
import sn.dev.user_service.data.entities.User;

@Data
@AllArgsConstructor
public class LoginRequests {
    @Email
    private String email;
    private String password;

    public User toEntity() {
        User user = new User();
        user.setPassword(this.password);
        user.setEmail(this.email);
        return user;
    }
}
/*
* # ------------------------------------------------------------------------------
# API Test Suite for User and Product Management
#
# Instructions:
# 1. Replace placeholder emails/passwords with actual test user credentials.
# 2. Run the requests in order to test the access control logic.
# ------------------------------------------------------------------------------

###
# @name LOGIN_CLIENT
# A CLIENT logs in to get their token.
POST https://localhost:8080/api/users/login
Content-Type: application/json

{
  "email": "client@gmail.com",### LOGIN
POST https://localhost:8080/api/users/login
Content-Type: application/json

{
  "email": "mouhammad@gmail.com",
  "password": "passer123"
}

> {% client.global.set("token", response.body.token) %}

<> 2025-07-30T154051.200.json
<> 2025-07-30T120154.200.json
<> 2025-07-29T162238.200.json
<> 2025-07-29T162237.200.json
<> 2025-07-29T162157.401.json
<> 2025-07-29T151432.200.json
<> 2025-07-29T151233.401.json
<> 2025-07-29T151153.401.json
<> 2025-07-29T113529.200.json
<> 2025-07-29T113243.200.json
<> 2025-07-29T113237.503.json
<> 2025-07-29T113015.200.json
<> 2025-07-29T113001.503.json
<> 2025-07-29T112954.503.json
<> 2025-07-29T112949.503.json
<> 2025-07-29T112946.503.json
<> 2025-07-29T112720.200.json
<> 2025-07-29T112647.401.json
<> 2025-07-29T112638.401.json
<> 2025-07-29T112554.401.json

### Remplacez <user_id> par l'ID de l'utilisateur à mettre à jour
PATCH https://localhost:8080/api/users/6888c31097df0cce6bd3fc84
Content-Type: application/json
Authorization: Bearer {{ token }}

{
  "name": "Mamadou Bah Updated",
  "avatar": "updated-avatar.png"
}

<> 2025-07-29T155704.200.json
### Créer un nouvel utilisateur
POST https://localhost:8080/api/users
Content-Type: application/json

{
  "name": "Mamadou Bah",
  "email": "mouhammadou@gmail.com",
  "password": "passer123",
  "role": "SELLER",
  "avatar": "url-to-avatar.png"
}

<> 2025-07-29T124817.201.json
<> 2025-07-29T124536.405.json
<> 2025-07-29T124319.405.json


### Supprimer un utilisateur
# Remplacez <user_id> par l'ID de l'utilisateur à supprimer
DELETE http://localhost:8080/api/users/6880d6c62447f9240a73b322
Authorization: Bearer {{ token }}

### Upload an image
POST https://localhost:8080/api/media
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW

------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="file"; filename="1.jpeg"
Content-Type: image/jpeg

< ../../Images/1.jpeg

------WebKitFormBoundary7MA4YWxkTrZu0gW--

<> 2025-07-29T130706.200.json

### Récupérer tous les utilisateurs (avec pagination)
GET https://localhost:8080/api/users
Accept: application/json
Authorization: Bearer {{ token }}

<> 2025-07-30T120210.200.json
<> 2025-07-29T155552.200.json
<> 2025-07-29T113634.200.json
<> 2025-07-29T113246.200.json
<> 2025-07-29T113022.500.json
<> 2025-07-29T112737.200.json
<> 2025-06-24T104641.404.json

### Récupérer tous les utilisateurs avec pagination personnalisée
# Les paramètres sont ?page=<numéro>&size=<taille>&sort=<champ,asc|desc>
# Issue : Lorsque les users sont recup il y a le champ password
GET http://localhost:8080/api/users?page=0&size=5&sort=name,asc
Accept: application/json
Authorization: Bearer {{ token }}

### Créer un nouvel utilisateur
POST https://localhost:8080/api/users
Content-Type: application/json

{
  "name": "Mamadou Bah",
  "email": "bih@bbu.vg",
  "password": "passer123",
  "role": "SELLER",
  "avatar": "url-to-avatar.png"
}

<> 2025-07-28T221636.201.json

### Créer un deuxième utilisateur
POST http://localhost:8080/api/users
Content-Type: application/json

{
  "name": "Fatou Diallo",
  "email": "fatou.diallo@example.com",
  "password": "hashedpassword456",
  "role": "USER",
  "avatar": "url-to-fatou-avatar.png"
}

### Récupérer un utilisateur par ID
# Remplacez <user_id> par un ID réel d'utilisateur créé (ex: l'ID de Mamadou ou Fatou)
GET https://localhost:8080/api/custom/users
Accept: application/json
Authorization: Bearer {{ token }}

<> 2025-07-30T130301.404.json
<> 2025-07-30T130249.404.json
<> 2025-07-30T120634.404.json
<> 2025-07-30T120618.200.json
<> 2025-07-30T120526.503.json
<> 2025-07-30T120255.200.json
<> 2025-07-30T120242.404.json
<> 2025-07-30T120231.200.json
<> 2025-07-29T151658.200.json
<> 2025-07-29T151503.200.json
<> 2025-07-29T113712.200.json
<> 2025-07-29T113550.200.json
<> 2025-07-29T113430.500.json
<> 2025-07-29T113335.500.json

### Mettre à jour un utilisateur (PUT - Remplacement complet)
# Remplacez <user_id> par l'ID de l'utilisateur à mettre à jour
PUT http://localhost:8080/api/users/685a9e7b9689361103c10e39
Content-Type: application/json
Authorization: Bearer {{ token }}

{
  "name": "Mamadou Bah Updated",
  "email": "mamadou.bah@example.com",
  "password": "passer123",
  "role": "CLIENT",
  "avatar": "updated-avatar.png"
}

### Mettre à jour partiellement un utilisateur (PATCH)
# Remplacez <user_id> par l'ID de l'utilisateur à mettre à jour
PATCH http://localhost:8080/api/users/6677f9e8a7b6c5d4e3f2g1h0
Content-Type: application/json

{
  "name": "Mamadou Bah Patch"
}

### Supprimer un utilisateur
# Remplacez <user_id> par l'ID de l'utilisateur à supprimer
DELETE http://localhost:8080/api/users/6880cb14dd6b7419dd87d8e4
Authorization: Bearer {{ token }}

### Tenter de récupérer un utilisateur supprimé (devrait retourner 404)
GET http://localhost:8080/api/users/6677f9e8a7b6c5d4e3f2g1h0
Accept: application/json

### Récupérer les métadonnées de l'API (découverte HATEOAS)
GET https://localhost:8080/api/products
Accept: application/json

### Accéder à la recherche personnalisée (si vous avez un findByEmail(String email) dans UserRepository)
# Note : Spring Data REST génère automatiquement des endpoints pour les méthodes de recherche
GET http://localhost:8080/api/users/search/findByEmail?email=mamadou.bah.updated@example.com
Accept: application/json

###
GET http://localhost:8080/api/products
Accept: application/json

### Create New Product
POST https://localhost:8080/api/products
Content-Type: multipart/form-data; boundary=WebAppBoundary
Authorization: Bearer {{ token }}

--WebAppBoundary
Content-Disposition: form-data; name="name"

My Awesome Product
--WebAppBoundary
Content-Disposition: form-data; name="description"

This is a detailed description of my awesome product. It's brand new and very cool.
--WebAppBoundary
Content-Disposition: form-data; name="price"

99.99
--WebAppBoundary
Content-Disposition: form-data; name="quantity"

10
--WebAppBoundary
Content-Disposition: form-data; name="images"; filename="image1.jpg"
Content-Type: image/jpeg

< ../../Téléchargements/jpeg
--WebAppBoundary
Content-Disposition: form-data; name="images"; filename="image2.png"
Content-Type: image/png

< ../../Téléchargements/jpeg(5)
--WebAppBoundary--

<> 2025-07-30T154102.201.json

###
DELETE https://localhost:8080/api/products/688a3d0c7dd491cef2c649f9
Content-Type: application/json
Authorization: Bearer {{ token }}
  "password": "bobo"
}

> {% client.global.set("client_token", response.body.token); %}

<> 2025-07-30T134747.200.json
<> 2025-07-30T134032.200.json
<> 2025-07-30T133928.401.json
<> 2025-07-30T133915.401.json

###
# @name LOGIN_SELLER
# A SELLER logs in to get their token.
POST https://localhost:8080/api/users/login
Content-Type: application/json

{
  "email": "try@gmail.com",
  "password": "passer123"
}

> {% client.global.set("seller_token", response.body.token); %}

<> 2025-07-30T134825.200.json
<> 2025-07-30T134105.200.json


###
# (SUCCESS) A SELLER creates a new product with images
# Le Content-Type est maintenant multipart/form-data pour gérer les fichiers.
# @name CREATE_PRODUCT
POST https://localhost:8080/api/products
Authorization: Bearer {{ seller_token }}
# La ligne Content-Type est souvent ajoutée automatiquement par l'outil
# lorsqu'il détecte un corps de requête multipart.

------WebKitFormBoundaryE19zNvXGzXaUmB34
Content-Disposition: form-data; name="name"

Laptop Pro
------WebKitFormBoundaryE19zNvXGzXaUmB34
Content-Disposition: form-data; name="description"

A powerful new laptop for professionals.
------WebKitFormBoundaryE19zNvXGzXaUmB34
Content-Disposition: form-data; name="price"

1299.99
------WebKitFormBoundaryE19zNvXGzXaUmB34
Content-Disposition: form-data; name="quantity"

50
------WebKitFormBoundaryE19zNvXGzXaUmB34
Content-Disposition: form-data; name="images"; filename="laptop1.jpg"
Content-Type: image/jpeg

< ../../Images/polo.jpg
------WebKitFormBoundaryE19zNvXGzXaUmB34
Content-Disposition: form-data; name="images"; filename="laptop2.png"
Content-Type: image/png

< ../../Téléchargements/240_F_92013034_wxFpIrag5a5vL3SlFNppkawxS6s4iqtU.jpg
------WebKitFormBoundaryE19zNvXGzXaUmB34--

<> 2025-07-30T154002.400.json
<> 2025-07-30T134540.400.json

###
# (SUCCESS) A SELLER creates a new product.
# This should succeed. We save the new product's ID for later tests.
# @name CREATE_PRODUCT
POST http://localhost:8080/api/products
Content-Type: application/json
Authorization: Bearer {{ seller_token }}

{
  "name": "Laptop Pro",
  "price": 1299.99,
  "description": "A powerful new laptop for professionals.",
  "stock": 50
}

> {% client.global.set("product_id", response.body.id); %}

###
# (SUCCESS) Anyone can view all products.
# This should succeed without any token.
GET https://localhost:8080/api/products

<> 2025-07-30T134839.200.json
<> 2025-07-30T134644.200.json

###
# (FAIL) A CLIENT tries to update a product.
# This should fail with a 403 Forbidden error.
PATCH https://localhost:8080/api/products/68876085527780d240292a5a
Content-Type: application/json
Authorization: Bearer {{ client_token }}

{
  "price": 1.00
}

<> 2025-07-30T134928.405.json

###
# (SUCCESS) The SELLER who created the product updates it.
# This should succeed.
PATCH https://localhost:8080/api/products/68876085527780d240292a5a
Content-Type: application/json
Authorization: Bearer {{ seller_token }}

{
  "price": 1250.00,
  "stock": 45
}

<> 2025-07-30T134958.405.json

###
# (FAIL) A CLIENT tries to delete a product.
# This should fail with a 403 Forbidden error.
DELETE https://localhost:8080/api/products/68876085527780d240292a5a
Authorization: Bearer {{ client_token }}

###
# (SUCCESS) The SELLER who created the product deletes it.
# This should succeed.
DELETE https://localhost:8080/api/products/68876085527780d240292a5a
Authorization: Bearer {{ seller_token }}

<> 2025-07-30T135048.403.json


# ==============================================================================
#  USER MANAGEMENT TESTS
# ==============================================================================

###
# (SUCCESS) Create a new user account.
# This endpoint should be public.
POST https://localhost:8080/api/users
Content-Type: application/json

{
  "name": "Temp User",
  "email": "temp.user@example.com",
  "password": "password123",
  "role": "CLIENT"
}

> {% client.global.set("temp_user_id", response.body.id); %}

<> 2025-07-30T135114.201.json

###
# (SUCCESS) A CLIENT tries to get the list of all users.
# This should fail with a 403 Forbidden error.
GET https://localhost:8080/api/users
Authorization: Bearer {{ client_token }}

<> 2025-07-30T135139.200.json

###
# (SUCCESS) A SELLER gets the list of all users.
# This should succeed.
GET https://localhost:8080/api/users
Authorization: Bearer {{ seller_token }}

<> 2025-07-30T135221.200.json
<> 2025-07-30T135157.200.json

###
# (SUCCESS) A CLIENT updates their own profile.
# This should succeed.
PATCH http://localhost:8080/api/users/{{ client_id }}  // Replace with a real client ID
Content-Type: application/json
Authorization: Bearer {{ client_token }}

{
  "name": "Client New Name"
}

###
# (FAIL) A CLIENT tries to delete another user's account.
# This should fail with a 403 Forbidden error.
DELETE https://localhost:8080/api/users/{{ temp_user_id }}
Authorization: Bearer {{ client_token }}

###
# (SUCCESS) A SELLER deletes the temporary user's account.
# This should succeed.
DELETE https://localhost:8080/api/users/{{ temp_user_id }}
Authorization: Bearer {{ seller_token }}
* */