# FrontSkeleton
Anaïs DEWEVER - Pauline GOFFINET - Edwige LEBLANC - Marianne LEPERE

## Les installations nécessaire
- Node JS : https://nodejs.org/en/download
- Angular : `npm install -g @angular/cli`

## Avant de lancer le projet

Lancer `npm i`

## Pour lancer le projet

Lancer `npm start` et se rendre sur `http://localhost:4200/`


# Pour le back-end du projet petit chevaux
Anaïs DEWEVER - Pauline GOFFINET - Edwige LEBLANC - Marianne LEPERE

# Pré-requis
Java 17 & Docker

# Installation du projet et Setup
CLonage du back :
```bash
     git clone git@github.com:Asatsukiii/back-projet-angular.git
 ```
Setup de la BDD :
- Copiez-collez le `.env.sample` en `.env`dans le dossier /back-projet-angular
- Remplissez le fichier `.env` avec les credentials de votre choix
- Créez la base de donnée avec Docker
```bash
     docker compose up
 ```
- Pour la remplir, executez les fichiers TABLES.sql et DEFAULT-ENTRIES.sql qui se trouvent dans /back-projet-angular/initdb

# Lancement du Back
- Pour lancer le back : éxecutez le fichier back-projet-angular\src\main\java\com\takima\backskeleton\BackSkeletonApplication.java

# Le swagger

le swagger est disponible à cette addresse : http://localhost:8080/swagger-ui.html

# Quelques endpoints retrouvables sur le swagger  :

- http://localhost:8080/statistiquesjoueur retourne toutes les statistiques de tous les joueurs
- http://localhost:8080/statistiquesjoueur/{id}  retourne les statistiques du joueur ayant l'id renseigné

- http://localhost:8080/pion idem pour les pions

- http://localhost:8080/parties idem pour récupérer les parties
- http://localhost:8080/parties/{id}

- http://localhost:8080/joueurs idem pour récupérer les joueurs
- http://localhost:8080/parties//{id}
