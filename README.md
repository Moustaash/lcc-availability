# Les Chalets Covarel – visualisation des disponibilités

Cette application React/TypeScript affiche les périodes d'occupation des chalets du portefeuille Les Chalets Covarel. Elle est livrée comme site statique (build Vite) et consomme des flux iCalendar (`.ics`) générés automatiquement. Si aucun calendrier n'est disponible, elle revient sur un export JSON de secours. L'objectif est d'offrir un tableau mensuel clair sur desktop, une vue property-first sur mobile et des outils simples de recherche (par nom ou date) pour les équipes commerciales.

## Sommaire
- [Fonctionnalités](#fonctionnalités)
- [Architecture et flux de données](#architecture-et-flux-de-données)
- [Sources de données](#sources-de-données)
  - [Flux iCalendar (chemin par défaut `/availability`)](#flux-icalendar-chemin-par-défaut-availability)
  - [Export JSON de secours (`/data/availability.json`)](#export-json-de-secours-dataavailabilityjson)
  - [Structure attendue pour `RawBooking`](#structure-attendue-pour-rawbooking)
- [Variables d'environnement](#variables-denvironnement)
- [Développement local](#développement-local)
- [Build & déploiement](#build--déploiement)
- [Mise à disposition des fichiers `.ics` avec n8n](#mise-à-disposition-des-fichiers-ics-avec-n8n)
- [Maintenance et extensions](#maintenance-et-extensions)

## Fonctionnalités
- **Vue calendrier mensuelle** pour chaque chalet avec code couleur réservation/option.
- **Recherche plein texte** sur les noms français des chalets.
- **Sélecteur de date** qui positionne automatiquement le calendrier sur le mois contenant la date ciblée.
- **Commutation desktop/mobile** :
  - Desktop → grille complète sur plusieurs chalets.
  - Mobile → focus sur un chalet à la fois avec sélecteur.
- **Thème clair/sombre** persisté côté navigateur.
- **Bandeau de synchronisation** qui reflète l'état du chargement des flux (`Idle`, `Syncing`, `Success`, `Error`).

## Architecture et flux de données
| Couche | Description |
| --- | --- |
| **Frontend** | SPA React 19 + Vite 6, Tailwind via CDN, hébergée en statique (dossier `dist`). |
| **Service de données** | `services/availabilityService.ts` tente d'abord de charger les flux `.ics` listés dans `constants.ts`. Si au moins un calendrier est atteignable, les réservations en sont issues. Sinon, le service bascule sur le fichier JSON `/data/availability.json`. |
| **Parser iCalendar** | `services/icsService.ts` convertit chaque `VEVENT` en `RawBooking` : gestion de `DTSTART`/`DTEND`/`DURATION`, fusion `SUMMARY`/`DESCRIPTION` pour détecter les options, exclusion des événements `STATUS:CANCELLED`, respect de `LAST-MODIFIED`/`DTSTAMP`. |
| **Normalisation UI** | `hooks/useCalendarData.ts` filtre les lignes indisponibles, calcule le statut (`reservation` ou `option`), crée des identifiants stables et regroupe les réservations par slug de propriété. |

## Sources de données

### Flux iCalendar (chemin par défaut `/availability`)
- `VITE_USE_ICS` (par défaut `true`) détermine si l'application tente de charger les flux `.ics`.
- `VITE_ICS_BASE_URL` permet de rediriger vers un autre hôte/CDN (`https://calendar.chalets-de-valdisere.com/availability` par exemple). Sans valeur, on pointe sur le dossier statique local `/availability`.
- Chaque propriété définie dans `constants.ts` doit disposer d'un fichier `<slug>.ics`.
- Un calendrier qui répond avec `STATUS:200` mais sans événements valides est simplement ignoré (aucune réservation créée).
- Les événements `STATUS:TENTATIVE` ou contenant les mots `option`, `tentative`, `pre-book` sont transformés en `Mode: 'option'`. Tout le reste devient `Mode: 'reservation'`.

### Export JSON de secours (`/data/availability.json`)
- Format attendu : tableau de `RawBooking`.
- L'application lit ce fichier si les flux `.ics` sont désactivés ou si tous les téléchargements échouent.
- Le fichier est servi sans cache (`fetch(..., { cache: 'no-store' })`).
- Exemple de montée à jour : un workflow externe (n8n, script CI, etc.) qui remplace `/app/dist/data/availability.json`.

### Structure attendue pour `RawBooking`
```ts
interface RawBooking {
  agency: number;
  site: number;
  culture: string;
  lot_no: number;
  lot_ref: string;        // utilisé pour déduire le slug (slugify + diacritiques retirés)
  start_date: string;     // ISO 8601
  end_date: string;       // ISO 8601, strictement > start_date
  comm_no: number;
  price_total_eur: string;
  price_sr_eur: string;
  discount_rate: string;
  hide_price_web: boolean;
  is_available: boolean;
  duration_days: number;
  updated_at: string;     // ISO, affichage "Dernière synchro"
  Mode: 'reservation' | 'option';
}
```

Le parser ICS remplit ces champs automatiquement ; un export JSON doit respecter la même structure afin que `useCalendarData` puisse filtrer et afficher correctement les réservations.

## Variables d'environnement
| Variable | Valeur par défaut | Effet |
| --- | --- | --- |
| `VITE_USE_ICS` | `true` | Forcer `false` pour ignorer les flux `.ics` et consommer uniquement le JSON. |
| `VITE_ICS_BASE_URL` | `/availability` | Racine HTTP(S) où sont exposés les calendriers. Exemple : `https://calendar.chalets-de-valdisere.com/availability`. |

Ces variables sont évaluées côté client via `import.meta.env`. Dans un déploiement statique, elles doivent être fournies au moment du build (`VITE_ICS_BASE_URL=... npm run build`).

## Développement local
1. **Prérequis** : Node.js ≥ 18 et npm.
2. **Installation** :
   ```bash
   npm install
   ```
3. **Démarrage du serveur de dev** :
   ```bash
   npm run dev
   ```
   Vite expose l'app sur `http://localhost:5173` par défaut.
4. **Simulation de données** :
   - Placer un fichier `public/data/availability.json` valide.
   - OU créer `public/availability/<slug>.ics` pour tester le parsing ICS localement.

## Build & déploiement
1. `npm run build` génère le site statique dans `dist/`.
2. Servir `dist/` derrière Nginx (ou tout CDN) avec en-têtes `Cache-Control` adaptés aux fichiers `.ics` et `.json`.
3. S'assurer que le dossier `dist/availability` (calendriers) et `dist/data` (JSON de secours) restent synchronisés par votre pipeline (n8n, rsync, etc.).

## Mise à disposition des fichiers `.ics` avec n8n
Le workflow n8n fourni monte deux volumes partagés :
- `ics-data` : dossier où le noeud `Create ICS` écrit `/data/site/availability/<slug>.ics`.
- `availability-data` : montage sur `/app/dist/data` pour pousser le `availability.json` de secours.

Extrait `docker-compose.yml` :
```yaml
services:
  n8n:
    image: docker.n8n.io/n8nio/n8n
    volumes:
      - n8n-data:/home/node/.n8n
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
          server_name _;
          root /usr/share/nginx/html;
          add_header Cache-Control "no-cache, must-revalidate";
          location = /availability/ { return 404; }
          location /availability/ {
            alias /usr/share/nginx/html/availability/;
            types { text/calendar ics; }
            default_type text/calendar;
            add_header Content-Type "text/calendar; charset=utf-8";
            add_header Cache-Control "no-cache, must-revalidate";
          }
        }
        NGINX
        exec nginx -g 'daemon off;'
volumes:
  n8n-data:
  ics-data:
  ics-confd:
  availability-data:
    external: true
    name: now40o44kc08gscc84sg08gc_availability_json
```

### Vérifications recommandées
1. Lancer/planifier le workflow n8n (`Schedule Trigger` toutes les heures).
2. Contrôler le dépôt des fichiers : `docker compose exec ics-nginx ls -l /usr/share/nginx/html/availability`.
3. Tester un flux : `curl -I https://<domaine>/availability/alice.ics` doit retourner `200` et `Content-Type: text/calendar`.
4. Configurer `VITE_ICS_BASE_URL` avec la racine HTTPS exposée par `ics-nginx` pour que le frontend consomme ces flux.

## Maintenance et extensions
- **Ajouter un chalet** : compléter `constants.ts` avec le slug + les libellés FR/EN/ES (et l'URL d'image). Générer le flux `.ics` correspondant dans n8n.
- **Modifier la logique de tri/affichage** : adapter `hooks/useCalendarData.ts` (normalisation) ou `components/AvailabilityGrid` (rendu calendrier).
- **Adapter le parsing ICS** : `services/icsService.ts` centralise toutes les règles (détection d'option, exclusions `CANCELLED`, calcul de durée). Toute évolution passe par ce fichier.
- **Surveiller les erreurs** : les exceptions réseau ICS sont loggées en console ; l'UI affiche un fallback JSON ou un message d'échec.

Pour toute question ou évolution, se référer aux modules cités dans ce document : ils décrivent exactement la chaîne de transformation des données de disponibilité.
