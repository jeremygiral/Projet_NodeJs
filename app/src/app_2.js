
//L'application requiert l'utilisation du module Express.
//La variable express nous permettra d'utiliser les fonctionnalités du module Express.  
var express = require('express');
 
// Nous définissons ici les paramètres du serveur.
var hostname = 'localhost'; 
var port = 3000; 
 
// La variable mongoose nous permettra d'utiliser les fonctionnalités du module mongoose.
var mongoose = require('mongoose'); 
// Ces options sont recommandées par mLab pour une connexion à la base
var options = { server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } }, 
replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } } };
 
//URL de notre base
var urlmongo = "mongodb://sa:password@ds247357.mlab.com:47357/projet_ynov_nodejs"; 
 
// Nous connectons l'API à notre base de données
mongoose.connect(urlmongo, options);
 
var db = mongoose.connection; 
db.on('error', console.error.bind(console, 'Erreur lors de la connexion')); 
db.once('open', function (){
    console.log("Connexion à la base OK"); 
}); 
 
// Nous créons un objet de type Express. 
var app = express(); 
 
var bodyParser = require("body-parser"); 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
 

 var myRouter = express.Router(); 
myRouter.route('/')
.all(function(req,res){ 
      res.json({message : "Bienvenue sur notre Ynov API ", methode : req.method});
});

 
var adresseSchema=mongoose.Schema({
   ID_ADRESSE: Number identity(1,1),
   CD_CODE_POSTAL: String,
   LB_VILLE: String,
   LB_PAYS: String,
   LB_REGION: String,
   LB_RUE: String,
   NUM_RUE: Number,
   MT_LONGITUDE: Number,
   MT_LATITUDE: Number
});
var Adresse=mongoose.model('Adresse',adresseSchema)
var groupeSchema=mongoose.Schema({
   ID_GROUPE: Number identity(1,1),
   LB_NOM: String,
   LB_DESC: String
});
var Groupe=mongoose.model('Groupe',groupeSchema)
/*==============================================================*/
/* Table : USER                                                 */
/*==============================================================*/
var userSchema=mongoose.Schema({
   ID_USER: Number identity(1,1),
   LB_NOM: String,
   LB_PRENOM: String,
   DT_NAISSANCE: Date,
   LOGIN: String,
   PASSWORD: String
});
var User=mongoose.model('User',userSchema)
var usergroupeSchema=mongoose.Schema({
   ID_USER: Number,
   ID_GROUPE: Number
});
var User=mongoose.model('UserGroupe',usergroupeSchema)
var usergroupeSchema=mongoose.Schema({
   ID_USER: Number,
   ID_ADRESSE: Number,
   IS_LIVRAISON: Boolean});
var User=mongoose.model('UserGroupe',usergroupeSchema)



myRouter.route('/adresses')

.get(function(req,res){ 
    Adresse.find(function(err, adresses){
        if (err){
            res.send(err); 
        }
        res.json(adresses); 
        
    })
}) // SUITE DU CODE

.post(function(req,res){
    // Nous utilisons le schéma Piscine
      var adresse = new Adresse();
    // Nous récupérons les données reçues pour les ajouter à l'objet Piscine
      adresse.ID_ADRESSE = req.body.ID_ADRESSE;
      adresse.CD_CODE_POSTAL = req.body.CD_CODE_POSTAL;
      adresse.LB_VILLE = req.body.LB_VILLE;
      adresse.LB_PAYS = req.body.LB_PAYS; 
      adresse.LB_REGION = req.body.LB_REGION;
      adresse.LB_RUE = req.body.LB_RUE;
      adresse.NUM_RUE = req.body.NUM_RUE;
      adresse.MT_LONGITUDE = req.body.MT_LONGITUDE;
      adresse.MT_LATITUDE = req.body.MT_LATITUDE; 


    //Nous stockons l'objet en base
      adresse.save(function(err){
        if(err){
          res.send(err);
        }
        res.send({message : 'Bravo, l\'adresse est maintenant stockée en base de données'});
      })
})

myRouter.route('/')
.all(function(req,res){ 
      res.json({message : "Bienvenue sur notre Frugal API ", methode : req.method});
});
  
myRouter.route('/piscines')
.get(function(req,res){ 
	Piscine.find(function(err, piscines){
        if (err){
            res.send(err); 
        }
        res.json(piscines);  
    }); 
})
.post(function(req,res){
      var piscine = new Piscine();
      piscine.nom = req.body.nom;
      piscine.adresse = req.body.adresse;
      piscine.tel = req.body.tel;
      piscine.description = req.body.description; 
      piscine.save(function(err){
        if(err){
          res.send(err);
        }
        res.json({message : 'Bravo, la piscine est maintenant stockée en base de données'});
      }); 
}); 
 
myRouter.route('/piscines/:piscine_id')
.get(function(req,res){ 
            Piscine.findById(req.params.piscine_id, function(err, piscine) {
            if (err)
                res.send(err);
            res.json(piscine);
        });
})
.put(function(req,res){ 
                Piscine.findById(req.params.piscine_id, function(err, piscine) {
                if (err){
                    res.send(err);
                }
                        piscine.nom = req.body.nom;
                        piscine.adresse = req.body.adresse;
                        piscine.tel = req.body.tel;
                        piscine.description = req.body.description; 
                              piscine.save(function(err){
                                if(err){
                                  res.send(err);
                                }
                                res.json({message : 'Bravo, mise à jour des données OK'});
                              });                
                });
})
.delete(function(req,res){ 
 
    Piscine.remove({_id: req.params.piscine_id}, function(err, piscine){
        if (err){
            res.send(err); 
        }
        res.json({message:"Bravo, piscine supprimée"}); 
    }); 
    
});


app.use(myRouter);   
app.listen(port, hostname, function(){
	console.log("Mon serveur fonctionne sur http://"+ hostname +":"+port); 
});
 