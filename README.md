-------TaskFlow - Collaborative Project Management------

# ------L'équipe------- :
Mariam Bernaoui - Project Manager & Developer ;
@Mariambernaouii27
Malak El Mousati  - Developer ;@
Amina Ben Taher - Developer  ;@aminaardam 
Firdaws Akkar  -Developer ; @fer13-+
Fatima zahra roukdi -Developer ;@

#------Feature Distribution-------:
Mariam : F1- authentification et F5 - dashboard
Ferdaws : F2 – Creation et gestion des projets  et f8 - Création des membre d’un projet 
Malak : F3- Gestion des taches et F4- Assignation des taches aux membres 
Amina : F6- filtrage , recherche, pagination et F7- sauvegarde des brouillons 
Fatima : F9- Historique des activites et F10 – Notifications et gestion des évènement cote client

----------------------------------------------------------------------
-----------     ETAPES POUR LANCER L'APP-----------------

# 1. Cloner le repo
git clone https://github.com/MariamBernaouii27/TaskFlow.git

# 2. Creer .env file in backend/ avec ces valeurs:
MONGO_URI=mongodb://mongo:27017/taskflow
JWT_SECRET=supersecretkey
PORT=5000

# 3. lancer
cd backend
docker-compose up --build

# 4. ouvrir frontend/login.html

--------------------------------------------------------------------

 ---------------------Technical Stack--------------------------
_Backend:  Node.js & Express.js  
_Frontend: Vanilla JavaScript & Axios  
_Database : MongoDB (Container via Docker)  
_DevOps : Docker Compose
