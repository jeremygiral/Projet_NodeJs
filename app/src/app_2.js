
//L'application requiert l'utilisation du module Express.
//La variable express nous permettra d'utiliser les fonctionnalités du module Express.
var express = require('express');
//var jwt = require('json-web-token');
require('dotenv').config()
// Nous définissons ici les paramètres du serveur.
var hostname = 'localhost';
var port = 3000;
// Your node app

var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);

// La variable mongoose nous permettra d'utiliser les fonctionnalités du module mongoose.
var mongoose = require('mongoose'),
Schema = mongoose.Schema,
relationship = require("mongoose-relationship");
// Ces options sont recommandées par mLab pour une connexion à la base
var options = { server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } } };

//URL de notre base
//var urlmongo = "mongodb://sa:password@ds247357.mlab.com:47357/projet_ynov_nodejs";

// Nous connectons l'API à notre base de données
mongoose.connect("mongodb://"+process.env.DB_USER+":"+process.env.DB_PASS+"@"+process.env.DB_HOST+"/projet_ynov_nodejs",options);

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

var groupeSchema=mongoose.Schema({
	groupName: String,
	description: String,
	users: [{ type:Schema.ObjectId, ref:"User"}],
	isValable: Boolean,
	createAt: {type: Date, default : Date.now() }
});
var Groupe=mongoose.model('Groupe',groupeSchema)

var adresseSchema=mongoose.Schema({
	postalCode: String,
	city: String,
	country: String,
	state: String,
	street: String,
	streetNum: Number,
	longitude: Number,
	latitude: Number,
	isDelivery: Boolean,
	isValable: Boolean,
	createAt: {type: Date, default : Date.now() },
	users: [{ type:mongoose.Schema.ObjectId, ref:"User"}]
});
var Adresse=mongoose.model('Adresse',adresseSchema)

var userSchema=mongoose.Schema({
	name: String,
	surname: String,
	birthday: String,
	email: String,
	login: String,
	password: String,
	adresses: [{type: mongoose.Schema.ObjectId, ref: 'Adresse', childPath:"users"}],
	groupes: [{type: mongoose.Schema.ObjectId, ref: 'Groupe', childPath:"users"}],
	status: {type: String,
		enum: ["Prospect","Client"],
		default: "Prospect"},
		isValable: {type: Boolean, default: true},
		createAt: {type: Date, default : Date.now() }
	});
	userSchema.plugin(relationship,{relationshipPathName:'adresses'});
	userSchema.plugin(relationship,{relationshipPathName:'groupes'});
	var User=mongoose.model('User',userSchema)

	function comparePassword(pswtest, callback){
		var userExist = false;
		User.find({deleted: false}, function(err, users){
			users.forEach(function(user){
				var salt = bcrypt.genSaltSync(10);
				var hash = bcrypt.hashSync(user.login+"."+user.password, salt);
				bcrypt.compare(pswtest,hash,function(res){
					userExist = true;
				});
			});
			callback(userExist);
		});
	}

	var myRouter = express.Router();
	myRouter.route('/')
	.all(function(req,res){
		res.json({message : "Bienvenue sur notre Ynov API ", methode : req.method});
	});

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
		var adresse= new Adresse();
		var groupe= new Groupe();
		var passwordToSave = bcrypt.hashSync(req.body.password, salt);
		// Nous récupérons les données reçues pour les ajouter à l'objet Piscine
		user.name = req.body.name;
		user.surname = req.body.surname;
		user.email=req.body.email;
		user.birthday = req.body.birthday;
		user.login = req.body.login;
		user.password = passwordToSave;
		user.status = req.body.status;
		user.isValable=true;
		user.adresses.push(adresse);
		user.groupes.push(groupe);
		user.save(function(err,user){
			if(err){
				res.send(err);
			}

			// Nous récupérons les données reçues pour les ajouter à l'objet Piscine
			adresse.postalCode = req.body.adresses.postalCode;
			adresse.city = req.body.adresses.city;
			adresse.country = req.body.adresses.country;
			adresse.state = req.body.adresses.state;
			adresse.street = req.body.adresses.street;
			adresse.streetNum = req.body.adresses.streetNum;
			adresse.longitude = req.body.adresses.longitude;
			adresse.latitude = req.body.adresses.latitude;
			adresse.users.push(user);
			adresse.save();

			//var groupe = new Groupe();
			groupe.groupName=req.body.groupes.groupName;
			groupe.description=req.body.groupes.description;
			groupe.users.push(user);
			groupe.save();
		})
	})

	myRouter.route('/user/:ID_USER')
	.get(function(req,res){
		User.findById(req.params.ID_USER, function(err, user) {
			if (err){
				res.send(err);
			}else{
				res.json(user);
			}
		})
	})
	.put(function(req,res){
		User.findById(req.params.ID_USER, function(err, user) {
			if (err){
				res.send(err);
			}
			var user = new User();
			var adresse= new Adresse();
			var groupe= new Groupe();
			// Nous récupérons les données reçues pour les ajouter à l'objet Piscine
			user.name = req.body.name;
			user.surname = req.body.surname;
			user.email = req.body.email;
			user.birthday = req.body.birthday;
			user.login = req.body.login;
			user.password = req.body.password;
			user.status = req.body.status;
			user.adresses.push(req.body.adresse);
			user.groupes.push(req.body.groupe);
			user.save().then(function(err,user){
					if(err){
						res.send(err);
					}

					// Nous récupérons les données reçues pour les ajouter à l'objet Piscine
					adresse.postalCode = req.body.adresses.postalCode;
					adresse.city = req.body.adresses.city;
					adresse.country = req.body.adresses.country;
					adresse.state = req.body.adresses.state;
					adresse.street = req.body.adresses.street;
					adresse.streetNum = req.body.adresses.streetNum;
					adresse.longitude = req.body.adresses.longitude;
					adresse.latitude = req.body.adresses.latitude;
					adresse.users.push(user);
					adresse.save();

					//var groupe = new Groupe();
					groupe.groupName=req.body.groupes.groupName;
					groupe.description=req.body.groupes.description;
					groupe.users.push(user);
					groupe.save();
				});
			})
		})
				/*{
				email:user.email
			},{
				name:user.name,
				surname:user.surname,
				email:user.email,
				birthday:user.birthday,
				login:user.login,
				password:user.password,
				status:user.status,
				adresses:user.adresses,
				groupes:user.groupes
			},*/
	.delete(function(req,res){

		User.remove({_id: req.params.ID_USER}, function(err, user){
			if (err){
				res.send(err);
			}
			res.json({message:"Bravo, utilisateur supprimé"});
		})

	})

	myRouter.route('/user/softdelete/:ID_USER')
	.get(function(req,res){
		User.findById(req.params.ID_USER, function(err, user) {
			if (err){
				res.send(err);
			}
			user.isValable=false;
			user.save();
		})
	})


	myRouter.route('/users/search:NB')
	.get(function(req,res){
		FindAll(req.params.NB, function(js){
			console.log('test dans route : '+ js);
			res.json({data: js});
		});

	})
	function FindAll(NB, callback){
		var finalJSON=[];
		//var finalJSON = [].concat.apply([],User.adresses.find().limit(parseInt(NB)),User.groupes.find().limit(parseInt(NB)));
		//User.find({adresses: Adresse._id}).limit(parseInt(NB)).exec(function (err, users) {
		User.find().limit(parseInt(NB)).exec(function (err, users) {
			if (err) return handleError(err);
			callback(users);
			//console.log('Adresse', users);
			//finalJSON=[].concat.apply(finalJSON,users);// prints "The author is Ian Fleming"
		});
	}
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
		groupe.groupName = req.body.groupName;
		groupe.description = req.body.description;
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
			groupe.groupName = req.body.groupName;
			groupe.description = req.body.description;
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
	myRouter.route('/groupe/softdelete/:ID_GROUPE')
	.get(function(req,res){
		Groupe.findById(req.params.ID_GROUPE, function(err, groupe) {
			if (err){
				res.send(err);
			}
			groupe.isValable=false;
			groupe.save();
		});
	});

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
		adresse.postalCode = req.body.postalCode;
		adresse.city = req.body.city;
		adresse.country = req.body.country;
		adresse.state = req.body.state;
		adresse.street = req.body.street;
		adresse.streetNum = req.body.streetNum;
		adresse.longitude = req.body.longitude;
		adresse.latitude = req.body.latitude;


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
			adresse.postalCode = req.body.postalCode;
			adresse.city = req.body.city;
			adresse.country = req.body.country;
			adresse.state = req.body.state;
			adresse.street = req.body.street;
			adresse.streetNum = req.body.streetNum;
			adresse.longitude = req.body.longitude;
			adresse.latitude = req.body.latitude;
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
	myRouter.route('/adresse/softdelete/:ID_ADRESSE')
	.get(function(req,res){
		Adresse.findById(req.params.ID_ADRESSE, function(err, adresse) {
			if (err){
				res.send(err);
			}
			adresse.isValable=false;
			adresse.save();
		});
	});


	app.use(myRouter);
	app.listen(port, hostname, function(){
		console.log("Mon serveur fonctionne sur http://"+ hostname +":"+port);
	});
