var express = require('express');
var session = require('cookie-session'); // Charge le middleware de sessions
var bodyParser = require('body-parser'); // Charge le middleware de gestion des paramètres
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var fs = require("fs");
var app = express();
var csv = require("fast-csv");
var csvStream = csv.createWriteStream({headers: false}),
writableStream = fs.createWriteStream("listAbo.csv");

writableStream.on("finish", function(){
  console.log("DONE!");
});

var dataArr = [];
fs.createReadStream('listAbo.csv')
    .pipe(csv())
    .on('data', function(data){
        dataArr.push(data); // Add a row
    })


/* On utilise les sessions */
app.use(session({secret: 'listtopsecret'}))


/* S'il n'y a pas de todolist dans la session,
on en crée une vide sous forme d'array avant la suite */
.use(function(req, res, next){
  if (typeof(req.session.Abo) == 'undefined') {
    req.session.Abo = [];
  }
  next();
})

/* On affiche la liste et le formulaire */
.get('/list', function(req, res) {
  res.render('list.ejs', {Abo: dataArr});
})

/* On ajoute un élément à la liste d'abonnés */
.post('/form', urlencodedParser, function(req, res) {
  if (req.body.newAboFirstName != '') {
    //req.session.Abo.push(req.body.newAboFirstName+'</br>'+req.body.newAboLastName+'</br>'+req.body.newAboAddress+'</br>'+req.body.newAboPseudo+'</br>'+req.body.newAboEmail);
    console.log(dataArr);
    dataArr.push([req.body.newAboFirstName,req.body.newAboLastName,req.body.newAboAddress,req.body.newAboPseudo,req.body.newAboEmail]);
    //console.log(dataArr);
    csv
        .writeToPath("listAbo.csv",dataArr, {headers: false})
   .on("finish", function(){
      console.log("done!");
   });
   alert("Follower added.");
  }
  res.redirect('/list');
})

/* Supprime un élément de la todolist */
.get('/delete/:id', function(req, res) {
  if (req.params.id == 'all') {
    dataArr=[];
    csv
        .writeToPath("listAbo.csv",dataArr, {headers: false})
   .on("finish", function(){
      console.log("done!");
   });
   alert("All followers have been delete.");
  }
    else if (req.params.id != ''){
    dataArr.splice(req.params.id-1, 1);
    csv
        .writeToPath("listAbo.csv",dataArr, {headers: false})
   .on("finish", function(){
      console.log("done!");
   });
   alert("The follower has been delete.");
  }
  res.redirect('/list');
})

/* On redirige vers la todolist si la page demandée n'est pas trouvée */
.use(function(req, res, next){
  res.redirect('/list');
})

.listen(8080);

/*function deleteAll(){
  var result = confirm('Are you sure to delete all followers ?');
  if (result) {
    dataArr=[];
    csv
        .writeToPath("app/listAbo.csv",dataArr, {headers: false})
   .on("finish", function(){
      console.log("done!");
   });
  }
}*/
