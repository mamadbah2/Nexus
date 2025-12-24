# API Endpoints Documentation pour My Account

Ce document décrit les endpoints API que le backend doit implémenter pour supporter les fonctionnalités de gestion de compte utilisateur.

## Base URL
```
{API_BASE_URL}/api/users
```

## Authentication
Tous les endpoints nécessitent une authentification Bearer token dans le header :
```
Authorization: Bearer {JWT_TOKEN}
```

## Endpoints

### 1. GET /api/users/{userId}
**Description:** Récupère les informations du profil utilisateur par ID

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
Accept: application/json
```

**Parameters:**
- `userId` (path): L'ID de l'utilisateur à récupérer

**Response 200:**
```json
{
  "id": "user-uuid",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "role": "SELLER",
  "avatar": "https://api.example.com/uploads/avatars/user-uuid.jpg",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-15T12:30:00Z"
}
```

**Response 401:**
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

**Response 404:**
```json
{
  "error": "Not Found",
  "message": "User not found"
}
```

---

### 2. PATCH /api/users/{userId}
**Description:** Met à jour PARTIELLEMENT les informations utilisateur (seulement les champs fournis)

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
Accept: application/json
```

**Parameters:**
- `userId` (path): L'ID de l'utilisateur à mettre à jour

**Request Body (optionnel, seulement les champs à modifier):**
```json
{
  "name": "John Smith",
  "email": "john.smith@example.com",
  "avatar": "https://api.example.com/uploads/avatars/new-avatar.jpg"
}
```

**Important:** PATCH doit mettre à jour SEULEMENT les champs fournis dans le body, pas remplacer tout l'objet.

**Response 200:**
```json
{
  "id": "user-uuid",
  "name": "John Smith",
  "email": "john.smith@example.com",
  "role": "SELLER",
  "avatar": "https://api.example.com/uploads/avatars/new-avatar.jpg",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-15T14:45:00Z"
}
```

**Response 400:**
```json
{
  "error": "Bad Request",
  "message": "Invalid email format"
}
```

**Response 409:**
```json
{
  "error": "Conflict",
  "message": "Email already exists"
}
```

---

### 3. POST /api/media
**Description:** Upload d'un fichier image vers le système de stockage media

**Headers:**
```
Content-Type: multipart/form-data
```

**Request Body (FormData):**
```
file: [File] (image file)
```

**Response 200:**
```json
{
  "imageUrl": "https://api.example.com/uploads/media/generated-filename.jpg",
  "originalName": "avatar.jpg",
  "size": 123456,
  "mimeType": "image/jpeg"
}
```

**Response 413:**
```json
{
  "error": "Payload Too Large",
  "message": "File size exceeds 5MB limit"
}
```

**Response 415:**
```json
{
  "error": "Unsupported Media Type",
  "message": "Only image files are allowed"
}
```

---

## Flux de mise à jour avec avatar

### Scénario 1: Mise à jour texte seulement
1. Frontend appelle `PATCH /api/users/{userId}` avec les champs texte
2. Backend met à jour seulement les champs fournis

### Scénario 2: Mise à jour avec nouvel avatar
1. Frontend appelle `POST /api/media` avec le fichier image
2. Backend retourne l'URL de l'image uploadée
3. Frontend appelle `PATCH /api/users/{userId}` avec les champs texte + l'URL de l'avatar
4. Backend met à jour l'utilisateur avec toutes les nouvelles données

### Scénario 3: Suppression d'avatar
1. Frontend appelle `PATCH /api/users/{userId}` avec `{"avatar": null}`
2. Backend définit l'avatar à null et supprime l'ancien fichier (si applicable)

---

## Validation Rules

### Name
- Optionnel (pour PATCH)
- Minimum 2 characters si fourni
- Maximum 100 characters
- No special characters except spaces, hyphens, and apostrophes

### Email
- Optionnel (pour PATCH)
- Valid email format si fourni
- Must be unique in the system
- Maximum 255 characters

### Avatar
- Optionnel
- Peut être une URL (string) ou null (pour supprimer)
- Si fourni, doit être une URL valide

### Media Upload (/api/media)
- Supported formats: JPEG, PNG, GIF, WebP
- Maximum file size: 5MB
- Recommended dimensions: 400x400px (will be resized automatically)

---

## Error Responses

### 400 - Bad Request
```json
{
  "error": "Bad Request",
  "message": "Validation failed",
  "details": {
    "name": ["Name must be at least 2 characters"],
    "email": ["Invalid email format"]
  }
}
```

### 401 - Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired authentication token"
}
```

### 404 - Not Found
```json
{
  "error": "Not Found",
  "message": "User not found"
}
```

### 409 - Conflict
```json
{
  "error": "Conflict",
  "message": "Email already exists"
}
```

### 413 - Payload Too Large
```json
{
  "error": "Payload Too Large",
  "message": "File size exceeds maximum allowed size"
}
```

### 415 - Unsupported Media Type
```json
{
  "error": "Unsupported Media Type",
  "message": "File type not supported. Only images are allowed."
}
```

### 500 - Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

## Notes d'implémentation Backend

### 1. PATCH vs PUT
- **PATCH** : Met à jour seulement les champs fournis dans le request body
- **PUT** : Remplacerait tout l'objet (non utilisé ici)

### 2. Storage des avatars
- Les fichiers d'avatar sont uploadés via `/api/media` 
- Le système retourne une URL publique
- L'URL est ensuite stockée dans le champ `avatar` de l'utilisateur

### 3. Nettoyage des anciens avatars
- Lors de la mise à jour d'un avatar, supprimer l'ancien fichier du stockage
- Lors de la suppression (avatar = null), supprimer le fichier

### 4. Sécurité
- Vérifier que l'utilisateur peut seulement modifier son propre profil
- Valider le token JWT et extraire l'userId pour la vérification

### 5. Exemple d'implémentation PATCH
```java
// Pseudocode Java
@PatchMapping("/users/{userId}")
public UserResponse updateUser(@PathVariable String userId, @RequestBody Map<String, Object> updates) {
    User user = userRepository.findById(userId);
    
    // Mettre à jour seulement les champs fournis
    if (updates.containsKey("name")) {
        user.setName((String) updates.get("name"));
    }
    if (updates.containsKey("email")) {
        user.setEmail((String) updates.get("email"));
    }
    if (updates.containsKey("avatar")) {
        String oldAvatar = user.getAvatar();
        user.setAvatar((String) updates.get("avatar"));
        
        // Supprimer l'ancien avatar si nécessaire
        if (oldAvatar != null && !oldAvatar.equals(user.getAvatar())) {
            mediaService.deleteFile(oldAvatar);
        }
    }
    
    return userRepository.save(user);
}
```
