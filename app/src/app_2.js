
//L'application requiert l'utilisation du module Express.
//La variable express nous permettra d'utiliser les fonctionnalités du module Express.
var express = require('express');

// Nous définissons ici les paramètres du serveur.
var hostname = 'localhost';
var port = 3000;

// La variable mongoose nous permettra d'utiliser les fonctionnalités du module mongoose.
var mongoose = require('mongoose'),
Schema = mongoose.Schema,
relationship = require("mongoose-relationship");
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
				user.adresses.push(adresse);
				user.save();

			})

			var groupe = new Groupe();
			groupe.LB_NOM_GROUPE=req.body.groupes.LB_NOM_GROUPE;
			groupe.LB_DESC=req.body.groupes.LB_DESC;
			groupe.save(function(err,groupe){
				if(err){
					res.send(err);
				}
				user.groupes.push(groupe);
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
				else
				{
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
						else{
							user.adresses.push(adresse);
							user.save();
						}
					})

					var groupe = new Groupe();
					groupe.LB_NOM_GROUPE=req.body.groupes.LB_NOM_GROUPE;
					groupe.LB_DESC=req.body.groupes.LB_DESC;
					groupe.save(function(err,groupe){
						if(err){
							res.send(err);
						}
						else {
							user.groupes.push(groupe);
							user.save();
						}

					})
				}
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



	myRouter.route('/user/search:NB')
	.get(function(req,res){
		FindAll(req.params.NB, function(js){
			console.log('test dans route : '+ js);
			res.json({data: js});
		});

	})
	function FindAll(NB, callback){
		var finalJSON=[];
		//var finalJSON = [].concat.apply([],User.adresses.find().limit(parseInt(NB)),User.groupes.find().limit(parseInt(NB)));
		User.find({adresses: Adresse._id}).limit(parseInt(NB)).exec(function (err, users) {
			if (err) return handleError(err);
			console.log('Adresse', users);
			finalJSON=[].concat.apply(finalJSON,users);// prints "The author is Ian Fleming"
		});
		User.find({groupes: Groupe._id}).limit(parseInt(NB)).exec(function (err, users) {
			if (err) return handleError(err);
			console.log('Groupe', users);
			finalJSON=[].concat.apply(finalJSON,users);// prints "The author is Ian Fleming"
		});
		callback(finalJSON);

	}
	/*app.use('/', require('./adresses/adresses'));
	app.use('/', require('./groupes/groupes'));
	app.use('/', require('./users/users'));*/

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

	app.use(myRouter);
	app.listen(port, hostname, function(){
		console.log("Mon serveur fonctionne sur http://"+ hostname +":"+port);
	});
