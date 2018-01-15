
//L'application requiert l'utilisation du module Express.
//La variable express nous permettra d'utiliser les fonctionnalités du module Express.
var express = require('express');
//var jwt = require('json-web-token');
require('dotenv').config()
// Nous définissons ici les paramètres du serveur.
var hostname = 'localhost';
var port = 3000;
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


// Nous connectons l'API à notre base de données
//mongoose.connect("mongodb://"+process.env.DB_USER+":"+process.env.DB_PASS+"@"+process.env.DB_HOST+"/projet_ynov_nodejs",options);
var urlmongo = "mongodb://sa:password@ds247357.mlab.com:47357/projet_ynov_nodejs";
mongoose.connect(urlmongo,options);
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
	groupName: {type: String,required: true},
	description: String,
	users: [{ type:Schema.ObjectId, ref:"User",unique: true}],
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
	users: [{ type:mongoose.Schema.ObjectId, ref:"User",unique: true}]
});
var Adresse=mongoose.model('Adresse',adresseSchema)

var userSchema=mongoose.Schema({
	name: String,
	surname: String,
	birthday: String,
	email: {type: String,required: true},
	login: {type: String,required: true},
	password: {type: String,required: true},
	adresses: [{type: mongoose.Schema.ObjectId, ref: 'Adresse', childPath:"users",unique:true}],
	groupes: [{type: mongoose.Schema.ObjectId, ref: 'Groupe', childPath:"users",unique:true}],
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
		User.findById(req.params.ID_USER, function(err, user) {
			if (err){
				res.send(err);
			}
			else{
				var user = new User();
				var adresse=new Adresse();
				var groupe= new Groupe();
				// Nous récupérons les données reçues pour les ajouter à l'objet user
				var passwordToSave = bcrypt.hashSync(req.body.password, salt);
				user.name = req.body.name;
				user.surname = req.body.surname;
				user.email=req.body.email;
				user.birthday = req.body.birthday;
				user.login = req.body.login;
				user.password = req.body.password;
				user.password = passwordToSave;
				user.status = req.body.status;
				user.isValable=true;
				user.save(function(err,user){
					if(err){
						res.send(err);
					}
					else {
						// Nous récupérons les données reçues pour les ajouter à l'objet user

						adresse._id=mongoose.Types.ObjectId();
						adresse.postalCode = req.body.adresses.postalCode;
						adresse.city = req.body.adresses.city;
						adresse.country = req.body.adresses.country;
						adresse.state = req.body.adresses.state;
						adresse.street = req.body.adresses.street;
						adresse.streetNum = req.body.adresses.streetNum;
						adresse.longitude = req.body.adresses.longitude;
						adresse.latitude = req.body.adresses.latitude;
						user.adresses.push(adresse._id);
						adresse.users.push(user._id);

						adresse.save(function(err, adresse) {
							if (err){
								res.send(err);
							}else{
								user.save();
								//res.json({message:"Bravo, utilisateur et adresse créés"});
							}

						})

						groupe._id=mongoose.Types.ObjectId();
						if(req.body.groupes.groupName){
							groupe.groupName=req.body.groupes.groupName;
						}else{
							groupe.groupName="Default";
						}
						groupe.description=req.body.groupes.description;
						groupe.users.push(user._id);
						user.groupes.push(groupe._id);
						groupe.save(function(err, groupe) {
							if (err){
								res.send(err);
							}else{
								user.save();
								res.json({message:"Bravo, utilisateur créé"});
							}
						})
					}
				})
			}
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
			else {
				var user = new User();
				var adresse=new Adresse();
				var groupe= new Groupe();
				// Nous récupérons les données reçues pour les ajouter à l'objet user
				var passwordToSave = bcrypt.hashSync(req.body.password, salt);
				user.name = req.body.name;
				user.surname = req.body.surname;
				user.email=req.body.email;
				user.birthday = req.body.birthday;
				user.login = req.body.login;
				user.password = req.body.password;
				user.password = passwordToSave;
				user.status = req.body.status;
				user.isValable=true;
				user.save(function(err,user){
					if(err){
						res.send(err);
					}
					else {
						// Nous récupérons les données reçues pour les ajouter à l'objet user

						//adresse._id=mongoose.Types.ObjectId();
						adresse.postalCode = req.body.adresses.postalCode;
						adresse.city = req.body.adresses.city;
						adresse.country = req.body.adresses.country;
						adresse.state = req.body.adresses.state;
						adresse.street = req.body.adresses.street;
						adresse.streetNum = req.body.adresses.streetNum;
						adresse.longitude = req.body.adresses.longitude;
						adresse.latitude = req.body.adresses.latitude;
						user.adresses.push(adresse._id);
						adresse.users.push(user._id);

						adresse.save(function(err, adresse) {
							if (err){
								res.send(err);
							}else{
								user.save();
								//res.json({message:"Bravo, utilisateur et adresse créés"});
							}

						})

						groupe._id=mongoose.Types.ObjectId();
						if(req.body.groupes.groupName){
							groupe.groupName=req.body.groupes.groupName;
						}else{
							groupe.groupName="Default";
						}
						groupe.description=req.body.groupes.description;
						groupe.users.push(user._id);
						user.groupes.push(groupe._id);
						groupe.save(function(err, groupe) {
							if (err){
								res.send(err);
							}else{
								user.save();
								res.json({message:"Bravo, utilisateur créé"});
							}
						})
					}
				})
			}
		})
	})
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
			res.json({message:"Bravo, utilisateur désactivé"});
		})
	})


	myRouter.route('/users/search:NB')
	.get(function(req,res){
		FindAll(req.params.NB, function(js){

			res.json({data: js});
		});

	})
	function FindAll(NB, callback){
		var finalJSON=[];
		var nombre=NB>10 ? 10 : NB;
		User.find().limit(parseInt(nombre)).exec(function (err, users) {
			if (err) return handleError(err);
			callback(users);
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

		var groupe = new Groupe();

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
