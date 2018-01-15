var express = require('express');
var app = express();
var myRouter = express.Router();
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    relationship = require("mongoose-relationship");

var adresseSchema=mongoose.Schema({
	CD_CODE_POSTAL: String,
	LB_VILLE: String,
	LB_PAYS: String,
	LB_REGION: String,
	LB_RUE: String,
	NUM_RUE: Number,
	MT_LONGITUDE: Number,
	MT_LATITUDE: Number,
	IS_LIVRAISON: Boolean,
	users: [{ type:mongoose.Schema.ObjectId, ref:"User"}]
});
var Adresse=mongoose.model('Adresse',adresseSchema)

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


myRouter.route('/adresses/:ID_ADRESSE')
.get(function(req,res){
	Adresse.findById(req.params.ID_ADRESSE, function(err, adresse) {
		if (err)
			res.send(err);
		res.json(adresse);
	});
})
.put(function(req,res){
	Adresse.findById(req.params.ID_ADRESSE, function(err, adresse) {
		if (err){
			res.send(err);
		}
		adresse.CD_CODE_POSTAL = req.body.CD_CODE_POSTAL;
		adresse.LB_VILLE = req.body.LB_VILLE;
		adresse.LB_PAYS = req.body.LB_PAYS;
		adresse.LB_REGION = req.body.LB_REGION;
		adresse.LB_RUE = req.body.LB_RUE;
		adresse.NUM_RUE = req.body.NUM_RUE;
		adresse.MT_LONGITUDE = req.body.MT_LONGITUDE;
		adresse.MT_LATITUDE = req.body.MT_LATITUDE;
		adresse.save(function(err){
			if(err){
				res.send(err);
			}
			res.json({message : 'Bravo, mise à jour des données OK'});
		});
	});
})
.delete(function(req,res){

	Adresse.remove({_id: req.params.ID_ADRESSE}, function(err, adresse){
		if (err){
			res.send(err);
		}
		res.json({message:"Bravo, adresse supprimée"});
	});

});
module.exports = myRouter;
