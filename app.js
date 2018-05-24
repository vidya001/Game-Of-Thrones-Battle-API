const express = require('express')
const bodyParser= require('body-parser')
const app = express()
const http = require('http')
const MongoClient = require('mongodb').MongoClient
var db;
var attacker_king
var defender_king_arr = new Array()
var region_arr = new Array()
var attacker_king_arr = new Array()
var name_arr = new Array()
var defender_size_arr = new Array()
var battle_type = new Array()
var defender_king, region
var win=0, loss=0
var defender_size = new Array()
var attacker_size = new Array()
var avg, min, max, name

function mostOccuredElem(arr1){
    var mf = 1;
    var m = 0;
    var item;
    for (var i=0; i<arr1.length; i++)
    {
            for (var j=i; j<arr1.length; j++)
            {
                if (arr1[i] == arr1[j])
                    m++;
                    if (mf<m)
                    {
                        mf=m; 
                        item = arr1[i];
                    }
            }
            m=0;
    }
    console.log(item+" ( " +mf +" times ) ") ;   
    return item
}             

MongoClient.connect('mongodb://vidyaaddagada:welcome123@ds133570.mlab.com:33570/got_battles', (err, dbcon) => {
    if(err){
        console.log(err);
    }
    else if(!err){
        db= dbcon;
        console.log("connected to db ")
    }

})

app.get('/list', (req, res) => {
    db.collection("Battles").find({}, { _id: 0, location: 1 }).toArray((err, result) => {
        if (err) throw err
        console.log(result)
        res.send(result)
    });
})

app.get('/count', (req, res) => {
    db.collection("Battles").find({}).toArray((err, result) => {
        if (err) throw err;
        console.log("Count = " + result.length)
        let count = result.length
        res.send({"count" : count})
    });
})

app.get('/stats', (req, res) => {
    var obj = {}
    db.collection('Battles').find({}).toArray((err,arr) => {
        if(arr){
            for(var i=0; i<arr.length; i++){
                attacker_king_arr.push(arr[i].attacker_king)
                defender_king_arr.push(arr[i].defender_king)
                region_arr.push(arr[i].region)
                name_arr.push(arr[i].name)
                if(arr[i].attacker_outcome == "win"){
                    win++
                }
                else if(arr[i].attacker_outcome == "loss"){
                    loss++
                }
                if(battle_type.indexOf(arr[i].battle_type)== -1 && arr[i].battle_type != "")
                    battle_type.push(arr[i].battle_type)
                defender_size_arr.push(arr[i].defender_size)
                if(arr[i].attacker_size != '')
                    attacker_size.push(arr[i].attacker_size)
            }
            
        }
        attacker_king = mostOccuredElem(attacker_king_arr)
        console.log("attacker = " + attacker_king)
        defender_king = mostOccuredElem(defender_king_arr)
        region = mostOccuredElem(region_arr)
        name = mostOccuredElem(name_arr)
        attacker_size = attacker_size.sort((a, b) => a-b)
        max = attacker_size[attacker_size.length-1]
        min = attacker_size[0]
        console.log("attacker_size = " + attacker_size)
        avg = attacker_size.reduce((a, b) => { return a+b })
        console.log("avg = " + avg)
        var responseBody = {
            'most-active':{
                'attacker_king': attacker_king,
                'defender_king': defender_king,
                'region': region,
                'name': name
            },
            'attacker_outcome':{
                'win': win,
                'loss': loss
            },
            'battle_type': battle_type,
            'defender_size':{
                'average': avg,
                'min': min,
                'max': max
            }
        }
        console.log(responseBody)
        res.send(responseBody)
    })
})

app.get('/search', (req, res) => {
    var queryParams = req.query;
    console.log(req.query);
    if(queryParams.king && queryParams.location && queryParams.type){
        db.collection("Battles").find({attacker_king: queryParams.king, location: queryParams.location, battle_type: queryParams.type}, {_id: 0, name: 1}).toArray((err, result) => {
            if (err) throw err
            console.log(result)
            res.send(result)
        })
    }
    else if(queryParams.king){
        db.collection("Battles").find({attacker_king: queryParams.king}, {_id: 0, name: 1}).toArray((err, result) => {
            if (err) throw err
            console.log(result)
            res.send(result)
        })
    }
})


app.get('/', (req, res) => res.send('Hello World!'))

http.createServer(app).listen(3000, () => console.log('Example app listening on port 3000!'))
