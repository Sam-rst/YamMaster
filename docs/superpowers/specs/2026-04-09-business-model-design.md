# Business Model — YamMaster

## Positionnement

**Slogan** : "Le Yam entre potes, avec de vrais dés"

**Valeurs fondamentales** :
- **Honnêteté** — Dés jamais truqués, probabilités affichées, pas de manipulation
- **Social** — Le jeu se vit entre amis et en famille, le partage est au cœur
- **Compétition équitable** — MMR, matchmaking par niveau, pas de pay-to-win

**Cible** :
- Primaire : 18-35 ans, joueurs casual mobile, entre amis
- Secondaire : 35-65 ans, joueurs de Yam traditionnels, en famille
- Tertiaire : joueurs compétitifs (toutes tranches d'âge)

**Positionnement vs concurrence** :
- Yahtzee With Buddies : dés perçus comme truqués, pubs agressives, asynchrone
- YamMaster : transparence totale, rewarded ads opt-in, temps réel, social

---

## Tunnel de conversion

```
DÉCOUVERTE          → Invitation ami, recherche Store, bouche-à-oreille familial
   ↓ (~30% installent)
TÉLÉCHARGEMENT      → Fiche Store attractive (4.5★, screenshots)
   ↓ (~50% lancent)
PREMIÈRE PARTIE     → Bot facile en <30s, pas de mur de login
   ↓ (~40% reviennent J+1)
RÉTENTION           → Quêtes, séries, classement MMR, saisons, amis
   ↓ (~8% paient)
MONÉTISATION        → Rewarded ads → Pass mensuel → Battle Pass → Boutique
   ↓ (~20% partagent)
AMBASSADEUR         → Partage score, invite ami, parrainage → boucle virale
```

Tunnel cible secondaire (35-65 ans) :
```
"Mon fils m'a montré" → Télécharge → Joue vs Bot → Joue en famille → Forte rétention
```

### Mécaniques d'acquisition virale
- Lien d'invitation : "Rejoins-moi sur YamMaster" → deeplink
- Parrainage : invite un ami → 200 pièces chacun
- Partage de score : image générée en fin de partie
- Partage de victoire épique : "Tu as fait un YAM !"

### Première expérience (5 premières minutes)
1. Ouvre l'app → écran simple, bouton "Jouer" en gros
2. Première partie vs Bot facile en <30s → le joueur gagne → dopamine
3. "Bravo ! Tu veux défier un ami ?" → bouton partage
4. Créer un compte (username + avatar)
5. "Tu as 8 parties aujourd'hui — joue !"

---

## Économie in-game (double monnaie)

### Monnaies

| Monnaie | Nom | Obtention | Utilisation |
|---------|-----|-----------|-------------|
| Soft currency | **Pièces YAM** | Parties, quêtes, parrainage, séries | Tournois, cosmétiques, parties bonus |
| Hard currency | **Gemmes** | Achat €, rewarded ads, Battle Pass, événements | Convertir en pièces, achats premium, Battle Pass |

### Sources de pièces (robinets)

| Source | Gain | Fréquence | Plafond |
|--------|------|-----------|---------|
| Victoire amicale | 15 pièces | Par partie | 8/jour |
| Défaite amicale | 5 pièces | Par partie | 8/jour |
| Victoire tournoi Bronze | 250 pièces | Illimité | Limité par les pièces |
| Quête quotidienne (pièces) | 50 pièces | ~2/jour | 3 quêtes/jour |
| Quête quotidienne (mixte) | 25 pièces + 5 gemmes | ~2/semaine | Variable |
| Série connexion (J1→J7) | 10→100 pièces | 1 cycle/semaine | Reset après J7 |
| Parrainage | 200 pièces | Par ami | One-shot |
| Récompense fin de saison | 500→8 000 pièces | /8 semaines | Selon rang |

### Sources de gemmes (robinets)

| Source | Gain | Fréquence |
|--------|------|-----------|
| Rewarded ad | 5 gemmes | Max 5/jour = 25 gemmes |
| Quête quotidienne (gemmes) | 10 gemmes | ~1/jour |
| Quête quotidienne (mixte) | 5 gemmes | ~2/semaine |
| Bonus complétion 3 quêtes | 15 gemmes | 1/jour |
| Battle Pass gratuit | 10→50 gemmes | Quelques paliers |
| Événement spécial | Variable | Occasionnel |
| Achat € | Voir packs | Illimité |

### Packs de gemmes (achat réel)

| Pack | Prix | Gemmes | Bonus |
|------|------|--------|-------|
| Poignée | 0.99€ | 100 | — |
| Sacoche | 4.99€ | 600 | +20% |
| Coffre | 9.99€ | 1 400 | +40% |
| Trésor | 19.99€ | 3 200 | +60% |

### Conversion Gemmes → Pièces

| Gemmes | Pièces | Bonus |
|--------|--------|-------|
| 50 | 500 | — |
| 100 | 1 100 | +10% |
| 250 | 3 000 | +20% |
| 500 | 6 500 | +30% |

### Dépenses de pièces (puits)

| Dépense | Coût |
|---------|------|
| Tournoi Bronze | 100 pièces |
| Tournoi Argent | 500 pièces |
| Tournoi Or | 1 000 pièces |
| Tournoi Diamant | 5 000 pièces |
| Partie bonus (au-delà quota) | 50 pièces |
| Cosmétique commun | 500 pièces |
| Cosmétique rare | 2 000 pièces |
| Cosmétique épique | 5 000 pièces |

### Équilibre joueur gratuit actif

```
Parties (~mix victoires/défaites) : ~80 pièces/jour
Quêtes quotidiennes :                50 pièces/jour
Série de connexion (moyenne) :       ~30 pièces/jour
Rewarded ads (3/jour) :              15 gemmes ≈ 150 pièces
                                    ─────────────────
Total :                             ~310 pièces/jour ≈ 2 170 pièces/semaine
```

→ 2 tournois Bronze/jour, 1 cosmétique commun/semaine, 1 tournoi Argent/2 jours.

---

## Quêtes quotidiennes

3 quêtes par jour, tirées aléatoirement :

| Type | Fréquence | Exemple | Récompense |
|------|-----------|---------|-----------|
| Pièces (commune) | ~2/jour | "Gagne 2 parties" | 50 pièces |
| Pièces (commune) | ~2/jour | "Fais 3 Brelans" | 30 pièces |
| Gemmes (rare) | ~1/jour | "Gagne un tournoi Bronze" | 10 gemmes |
| Mixte (rare) | ~2/semaine | "Joue 5 parties" | 25 pièces + 5 gemmes |

**Bonus complétion** : 3 quêtes terminées = **15 gemmes bonus**.

---

## MMR et classement (type Rocket League)

### Points MMR

- Départ : 1 000 MMR
- Gain/perte selon l'écart MMR adverse (+10 à +35 / -10 à -35)

### Rangs (4 divisions par rang : IV → I)

| Rang | MMR | Récompense fin de saison |
|------|-----|--------------------------|
| Bronze | 0-799 | 500 pièces |
| Argent | 800-1 199 | 1 000 pièces + 50 gemmes |
| Or | 1 200-1 599 | 2 000 pièces + 100 gemmes + skin commun |
| Diamant | 1 600-1 999 | 3 500 pièces + 200 gemmes + skin rare |
| Maître | 2 000-2 499 | 5 000 pièces + 350 gemmes + skin épique |
| Légende | 2 500+ | 8 000 pièces + 500 gemmes + skin légendaire exclusif |

### Matchmaking

- ±100 MMR (0-15s) → ±200 MMR (15-30s) → ±500 MMR (30-60s) → Bot si aucun adversaire
- Écart max : 500 MMR

### Tournois à mise

| Tournoi | Mise | Gain victoire | MMR requis |
|---------|------|--------------|-----------|
| Bronze | 100 | 250 | Aucun |
| Argent | 500 | 1 200 | 800 |
| Or | 1 000 | 2 500 | 1 200 |
| Diamant | 5 000 | 13 000 | 1 600 |

---

## Saisons (8 semaines)

### Cycle

```
Semaine 1      Soft reset MMR, nouvelle saison, nouveau Battle Pass
Semaine 2-7    Compétition, progression Battle Pass
Semaine 8      Dernière chance, fin de saison
               → Récompenses de rang distribuées
```

### Soft reset MMR

`nouveau_MMR = 1000 + (ancien_MMR - 1000) × 0.5`

### Battle Pass (30 paliers)

Progression : victoire = 30 XP, défaite = 15 XP, quête = 50 XP bonus.
~3 000 XP pour le palier 30 (~6 semaines de jeu régulier).

| Palier | Track gratuit | Track premium (150 gemmes) |
|--------|-------------|--------------------------|
| 1 | 20 pièces | Avatar exclusif saison |
| 5 | 50 pièces | Skin de dés rare |
| 10 | 10 gemmes | 500 pièces |
| 15 | 100 pièces | Thème de plateau saison |
| 20 | 20 gemmes | 1 000 pièces |
| 25 | 200 pièces | Animation de victoire |
| 30 | 50 gemmes | Skin légendaire saison + titre exclusif |

---

## Rétention

| Mécanisme | Fréquence | Détail |
|-----------|-----------|--------|
| Notification push | Temps réel | "Ton ami t'a défié !", "C'est ton tour !" |
| Quêtes quotidiennes | Journalier | 3 quêtes + bonus complétion |
| Série de connexion | Hebdomadaire | J1→J7, reset après |
| Classement MMR | Permanent | Monter/descendre de rang |
| Battle Pass | Saisonnier (8 sem) | 30 paliers de récompenses |
| Saisons | 8 semaines | Reset MMR + nouvelles cosmétiques |

**Métriques cibles** :
- Rétention J1 : 40%
- Rétention J7 : 20%
- Rétention J30 : 10%

---

## Pass YamMaster (abonnement mensuel)

**Prix** : 4.99€/mois

**Avantages** :
- Parties illimitées (plus de quota)
- Badge exclusif "Pass YamMaster" sur le profil
- +10% de pièces sur toutes les récompenses
- Stats avancées (historique détaillé, graphe de progression MMR)
- Accès anticipé aux nouvelles cosmétiques (24h avant la boutique)

**Objectif** : revenu récurrent prévisible, conversion des joueurs réguliers.

---

## Cosmétiques (ajoutés progressivement selon les saisons)

| Type | Complexité dev | Exemples |
|------|---------------|----------|
| Avatars | Très faible | Emojis, portraits |
| Skins de dés | Faible | Dés en feu, glacés, dorés, néon |
| Thèmes de plateau | Moyenne | Bois, spatial, jungle, luxe |
| Animations de victoire | Moyenne | Confettis, feux d'artifice |
| Badges/Titres | Très faible | "Le Chanceux", "Roi du Yam" |
| Bordures de profil | Faible | Cadre doré, animé |
| Sons de dés | Faible | Cristal, bois, métal |

---

## Monétisation par phase

### Alpha (v1.0.0-alpha.x)
- Parties illimitées, pas de monétisation
- Objectif : valider gameplay et rétention

### Beta (v1.0.0-beta.x)
- Quota 8 parties/jour
- Pièces + Gemmes activées
- Rewarded ads (5/jour max, opt-in)
- Tournois Bronze et Argent
- Boutique basique
- Objectif : valider l'économie, premiers revenus

### Launch (v1.0.0)
- Saisons 8 semaines + Battle Pass
- Tous les tournois (Bronze → Diamant)
- Boutique complète + packs gemmes
- Objectif : revenus récurrents

### Projection à 1 000 joueurs actifs (post-launch)

| Source | Revenu/mois |
|--------|-------------|
| Pass mensuel (8%) | 399€ |
| Battle Pass (5%) | 75€ |
| Packs gemmes | 100€ |
| Rewarded ads | 90€ |
| **Total brut** | **~664€/mois** |
| Commission stores (-30%) | -200€ |
| Frais serveur | -10€ |
| **Net estimé** | **~454€/mois** |

---

## Conformité légale

- Pièces et gemmes jamais convertibles en argent réel (sens unique)
- Probabilités des lootboxes affichées (si ajoutées)
- Pas de ciblage publicitaire sur les mineurs (RGPD)
- Mentions légales : "Les objets virtuels n'ont aucune valeur monétaire"
- Conforme aux règles App Store et Google Play sur les achats in-app
