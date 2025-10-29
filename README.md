# Visualiseur de Disponibilité des Chalets

Ce projet est une application web interactive conçue pour visualiser la disponibilité des locations de chalets. Elle offre une interface claire et responsive, permettant aux utilisateurs de consulter rapidement les périodes de réservation, les options, et les disponibilités sur un calendrier mensuel.

## Fonctionnalités Principales

- **Affichage Responsive :** L'interface s'adapte automatiquement à la taille de l'écran.
  - **Vue Bureau/Tablette :** Une grille complète affichant tous les chalets simultanément pour une vue d'ensemble.
  - **Vue Mobile :** Un calendrier mensuel focalisé sur un seul chalet à la fois, avec un sélecteur de propriété visuel et tactile.
- **Navigation Intuitive :** Navigation facile entre les mois avec des boutons "précédent" et "suivant".
- **Recherche et Filtrage :**
  - Recherche par nom de chalet (vue bureau).
  - Recherche par date spécifique, qui met en évidence la disponibilité de tous les chalets pour le jour sélectionné.
- **Chargement Dynamique des Données :** Les disponibilités sont récupérées automatiquement via des fichiers iCalendar (`.ics`) ou via un fichier JSON externe. Cette flexibilité permet d'alimenter l'outil directement depuis les flux générés par n8n sans redéploiement.
- **Thème Sombre/Clair :** Un sélecteur de thème pour s'adapter aux préférences de l'utilisateur.
- **Indicateurs Visuels Clairs :** Utilisation de codes couleur et d'icônes pour distinguer les réservations confirmées, les options et les jours disponibles.

---

## Architecture

L'application est construite sur une architecture découplée, optimisée pour la performance et la simplicité de déploiement.

### 1. Frontend (Application Statique)

C'est une **application web statique (SPA - Single Page Application)** construite avec :
- **React** et **TypeScript** pour une interface robuste et typée.
- **Tailwind CSS** pour un design moderne et responsive.

**Fonctionnement :**
1. Au chargement, le client (navigateur) télécharge les fichiers statiques de l'application (HTML, CSS, JavaScript) depuis un serveur web (ex: Nginx).
2. L'application effectue une requête `fetch` pour récupérer le fichier de données à l'URL `/data/availability.json`.
3. Les données JSON sont ensuite traitées et formatées pour être affichées dans le calendrier.

Cette approche rend le frontend extrêmement rapide et facile à héberger.

### 2. Mise à jour des Données (Workflow Externe)

La mise à jour des données de disponibilité est gérée par un **processus externe**, tel qu'un workflow **n8n** ou un script CI/CD.

**Fonctionnement :**
1. Le workflow externe (n8n) récupère les dernières données de disponibilité depuis une source (ex: Nocodb, une base de données, une autre API).
2. Il génère un fichier `availability.json` à jour.
3. Ce fichier est ensuite "poussé" (par exemple via FTP, SCP, ou une action de déploiement) directement dans le répertoire servi par le serveur web.

**Chemin de destination en production :** `/app/dist/data/availability.json` (ou un chemin équivalent où `dist` est la racine du site web servie par Nginx).

### Schéma de l'architecture

```
                                      +---------------------------------+
                                      |   Système Externe (ex: n8n)     |
                                      +---------------------------------+
                                                     |
                                                     | 1. Écrit le fichier availability.json
                                                     |    directement sur le serveur web
                                                     v
+-----------------------------------+   +-----------------------------------+
|      Serveur Web (ex: Nginx)      |   |        Frontend (Navigateur)      |
|-----------------------------------|   |-----------------------------------|
| - Racine web: /app/dist           |   | - React App (statique)            |
| - Sert /app/dist/data/avail...    |-->| - Demande /data/availability.json |
|   à la demande                    | 2.|                                   |
+-----------------------------------+   +-----------------------------------+
```

### Route API Interne (Méthode Alternative)

Le projet inclut également une route API serverless (`/app/api/push/route.ts`). Bien que le workflow principal soit externe (n8n), cette route peut servir :
- De méthode de mise à jour alternative.
- D'outil de test pour pousser des données rapidement.

Elle est conçue pour fonctionner de manière identique au workflow n8n : elle reçoit une requête `POST` sécurisée par un token et écrit le fichier `availability.json` dans le répertoire `dist/data`.

---

## Déploiement et Utilisation

### 1. Déploiement

- **Frontend :** Le projet doit être "buildé" en tant que site statique. Le résultat (généralement dans un dossier `dist` ou `out`) est ensuite servi par un serveur web comme Nginx.
- **Configuration Nginx :** Assurez-vous que votre serveur Nginx est configuré pour servir le contenu du dossier `dist`.
- **Variables d'environnement :** Si vous prévoyez d'utiliser la route API interne, configurez la variable d'environnement `PUSH_TOKEN` avec une valeur secrète.

### 2. Mettre à Jour les Données via n8n

Configurez votre workflow n8n pour qu'il dépose le fichier `availability.json` final au chemin exact attendu par votre serveur web (ex: `/app/dist/data/availability.json`). C'est la méthode recommandée en production.

### Utiliser des flux iCalendar (`.ics`)

L'application peut également charger automatiquement les indisponibilités à partir de flux iCalendar générés par n8n :

1. Déposez chaque fichier `.ics` dans le dossier statique `/availability` du site (ex: `/app/dist/availability/alice.ics`). Le nom du fichier doit correspondre au _slug_ de la propriété (par exemple `alice.ics`, `savoie-53.ics`, etc.).
2. Au chargement, le frontend récupère tous les calendriers `.ics`, les convertit en réservations (`reservation` ou `option`) puis les affiche.
3. Si aucun calendrier `.ics` n'est accessible, l'application retombe automatiquement sur le fichier JSON de secours (`/data/availability.json`).

Il est possible de pointer vers un autre emplacement (CDN, sous-domaine, etc.) via la variable d'environnement `VITE_ICS_BASE_URL`. Exemple : `VITE_ICS_BASE_URL="https://calendar.chalets-de-valdisere.com/availability"`.

Pour désactiver complètement la lecture des fichiers iCalendar, définissez `VITE_USE_ICS=false`.

#### Où récupérer les fichiers `.ics` générés par n8n ?

Le dépôt des fichiers peut être automatisé grâce au workflow n8n décrit ci-dessous. L'idée générale est de monter un volume partagé entre n8n et un Nginx dédié aux calendriers :

```yaml
services:
  n8n:
    image: docker.n8n.io/n8nio/n8n
    volumes:
      - ics-data:/data/site
      - availability-data:/app/dist/data
  ics-nginx:
    image: nginx:alpine
    volumes:
      - ics-data:/usr/share/nginx/html
      - ics-confd:/etc/nginx/conf.d
    command:
      - /bin/sh
      - -lc
      - |
        mkdir -p /usr/share/nginx/html/availability
        chmod -R 0777 /usr/share/nginx/html
        cat > /etc/nginx/conf.d/ics.conf <<'NGINX'
        server {
          listen 80;
          location /availability/ {
            alias /usr/share/nginx/html/availability/;
            types { text/calendar ics; }
            default_type text/calendar;
            add_header Cache-Control "no-cache, must-revalidate";
          }
        }
        NGINX
        exec nginx -g 'daemon off;'
volumes:
  ics-data:
  ics-confd:
  availability-data:
    external: true
```

Dans ce scénario :

- Le noeud `Create ICS` du workflow n8n écrit chaque fichier iCalendar dans `/data/site/availability/<slug>.ics`, ce qui correspond au volume `ics-data` partagé avec Nginx.
- Le conteneur `ics-nginx` expose ensuite les fichiers à l'URL publique `https://<votre-domaine>/availability/<slug>.ics`.
- Le volume `availability-data` permet de continuer à pousser `availability.json` au même emplacement que l'application statique.

Pour vérifier que le flux est correctement généré :

1. Exécutez le workflow n8n ou attendez son déclenchement planifié.
2. Contrôlez la présence du fichier dans le conteneur Nginx : `docker compose exec ics-nginx ls -l /usr/share/nginx/html/availability`.
3. Testez l'URL depuis votre poste : `curl -I https://<votre-domaine>/availability/alice.ics` doit retourner un code `200` et un `Content-Type: text/calendar`.

Configurez `VITE_ICS_BASE_URL` avec l'URL racine de ce service (ex. `https://calendar.chalets-de-valdisere.com/availability`) pour que l'application front récupère automatiquement les calendriers.

### 3. Mettre à Jour les Données via l'API (Alternative)

Pour utiliser la route API interne, envoyez une requête `POST` à votre URL de production.

**URL de l'API :** `https://<votre-domaine.com>/api/push`

**Exemple avec `curl` :**
```bash
curl -X POST "https://VOTRE_DOMAINE.com/api/push" \
-H "Content-Type: application/json" \
-H "Authorization: Bearer VOTRE_PUSH_TOKEN_SECRET" \
-d '[ { "lot_ref": "ALICE", "start_date": "2026-01-10", "end_date": "2026-01-17", "Mode": "reservation" } ]'
```
