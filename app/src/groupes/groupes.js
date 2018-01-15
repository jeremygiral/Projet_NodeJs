var express = require('express');
var app = express();
var myRouter = express.Router();
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    relationship = require("mongoose-relationship");

var groupeSchema=mongoose.Schema({
	LB_NOM_GROUPE: String,
	LB_DESC: String,
	users: [{ type:Schema.ObjectId, ref:"User"}]
});
var Groupe=mongoose.model('Groupe',groupeSchema)

myRouter.route('/groupes')

.get(function(req,res){
	Groupe.find(function(err, groupes){
		if (err){
			res.send(err);
		}
		res.json(groupes);

	})
}) // SUITE DU CODE

.post(function(req,res){
    // Nous utilisons le schéma Piscine
    var groupe = new Groupe();
    // Nous récupérons les données reçues pour les ajouter à l'objet Piscine
    groupe.LB_NOM_GROUPE = req.body.LB_NOM_GROUPE;
    groupe.LB_DESC = req.body.LB_DESC;
      //Nous stockons l'objet en base
      groupe.save(function(err){
      	if(err){
      		res.send(err);
      	}
      	res.send({message : 'Bravo, le groupe est maintenant stocké en base de données'});
      })
  })

myRouter.route('/groupes/:ID_GROUPE')
.get(function(req,res){
	Groupe.findById(req.params.ID_GROUPE, function(err, groupe) {
		if (err)
			res.send(err);
		res.json(groupe);
	});
})
.put(function(req,res){
	Groupe.findById(req.params.ID_GROUPE, function(err, groupe) {
		if (err){
			res.send(err);
		}
		groupe.LB_NOM_GROUPE = req.body.LB_NOM_GROUPE;
		groupe.LB_DESC = req.body.LB_DESC;
		groupe.save(function(err){
			if(err){
				res.send(err);
			}
			res.json({message : 'Bravo, mise à jour des données OK'});
		});
	});
})
.delete(function(req,res){

	Groupe.remove({_id: req.params.ID_GROUPE}, function(err, groupe){
		if (err){
			res.send(err);
		}
		res.json({message:"Bravo, groupe supprimé"});
	});

});
module.exports = myRouter;
