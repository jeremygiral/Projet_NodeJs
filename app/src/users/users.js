var express = require('express');
var app = express();
var myRouter = express.Router();
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    relationship = require("mongoose-relationship");
var userSchema=mongoose.Schema({
	LB_NOM: String,
	LB_PRENOM: String,
	DT_NAISSANCE: String,
	LOGIN: String,
	PASSWORD: String,
	adresses: [{type: mongoose.Schema.ObjectId, ref: 'Adresse', childPath:"users"}],
	groupes: [{type: mongoose.Schema.ObjectId, ref: 'Groupe', childPath:"users"}],
	STATUS: {type: String,
		enum: ["Prospect","Client"]}
	});
userSchema.plugin(relationship,{relationshipPathName:'adresses'});
userSchema.plugin(relationship,{relationshipPathName:'groupes'});
var User=mongoose.model('User',userSchema)

myRouter.route('/users')

.get(function(req,res){
	User.find(function(err, users){
		if (err){
			res.send(err);
		}
		res.json(users);

	})
})

.post(function(req,res){
    // Nous utilisons le schéma Piscine
    var user = new User();

        // Nous récupérons les données reçues pour les ajouter à l'objet Piscine
        user.LB_NOM = req.body.LB_NOM;
        user.LB_PRENOM = req.body.LB_PRENOM;
        user.DT_NAISSANCE = req.body.DT_NAISSANCE;
        user.LOGIN = req.body.LOGIN;
        user.PASSWORD = req.body.PASSWORD;
        user.STATUS = req.body.STATUS;
        user.save(function(err,user){
          if(err){
            res.send(err);
          }
          var adresse = new Adresse();
        // Nous récupérons les données reçues pour les ajouter à l'objet Piscine
        adresse.CD_CODE_POSTAL = req.body.adresses.CD_CODE_POSTAL;
        adresse.LB_VILLE = req.body.adresses.LB_VILLE;
        adresse.LB_PAYS = req.body.adresses.LB_PAYS;
        adresse.LB_REGION = req.body.adresses.LB_REGION;
        adresse.LB_RUE = req.body.adresses.LB_RUE;
        adresse.NUM_RUE = req.body.adresses.NUM_RUE;
        adresse.MT_LONGITUDE = req.body.adresses.MT_LONGITUDE;
        adresse.MT_LATITUDE = req.body.adresses.MT_LATITUDE;
        adresse.save(function(err,adresse){
          if(err){
            res.send(err);
          }
          user.adresse.push(adresse);
          user.save();

          })

        var groupe = new Groupe();
        groupe.LB_NOM_GROUPE=req.body.groupes.LB_NOM_GROUPE;
        groupe.LB_DESC=req.body.groupes.LB_DESC;
        groupe.save(function(err,groupe){
          if(err){
            res.send(err);
          }
          user.groupe.push(groupe);
          user.save();
        })
    })
})

myRouter.route('/users/:ID_USER')
.get(function(req,res){
	User.findById(req.params.ID_USER, function(err, user) {
		if (err)
			res.send(err);
		res.json(user);
	});
})
.put(function(req,res){
	User.findById(req.params.ID_USER, function(err, user) {
		if (err){
			res.send(err);
		}
		var user = new User();

		    // Nous récupérons les données reçues pour les ajouter à l'objet Piscine
		    user.LB_NOM = req.body.LB_NOM;
		    user.LB_PRENOM = req.body.LB_PRENOM;
		    user.DT_NAISSANCE = req.body.DT_NAISSANCE;
		    user.LOGIN = req.body.LOGIN;
		    user.PASSWORD = req.body.PASSWORD;
		    user.STATUS = req.body.STATUS;
		    user.save(function(err,user){
		    	if(err){
		    		res.send(err);
		    	}
  	      var adresse = new Adresse();
		    // Nous récupérons les données reçues pour les ajouter à l'objet Piscine
		    adresse.CD_CODE_POSTAL = req.body.adresses.CD_CODE_POSTAL;
		    adresse.LB_VILLE = req.body.adresses.LB_VILLE;
		    adresse.LB_PAYS = req.body.adresses.LB_PAYS;
		    adresse.LB_REGION = req.body.adresses.LB_REGION;
		    adresse.LB_RUE = req.body.adresses.LB_RUE;
		    adresse.NUM_RUE = req.body.adresses.NUM_RUE;
		    adresse.MT_LONGITUDE = req.body.adresses.MT_LONGITUDE;
		    adresse.MT_LATITUDE = req.body.adresses.MT_LATITUDE;
		    adresse.save(function(err,adresse){
		    	if(err){
		    		res.send(err);
		    	}
          user.adresse.push(adresse);
          user.save();

		    	})

		    var groupe = new Groupe();
		    groupe.LB_NOM_GROUPE=req.body.groupes.LB_NOM_GROUPE;
		    groupe.LB_DESC=req.body.groupes.LB_DESC;
		    groupe.save(function(err,groupe){
		    	if(err){
		    		res.send(err);
		    	}
          user.groupe.push(groupe);
          user.save();
		    })
		})

		});

})
.delete(function(req,res){

	User.remove({_id: req.params.ID_USER}, function(err, user){
		if (err){
			res.send(err);
		}
		res.json({message:"Bravo, utilisateur supprimé"});
	});

});


module.exports = myRouter;
