var mysql = require("mysql");
var express = require("express");
var session = require("express-session");
var cors = require("cors");
var path = require("path");
var bodyParser = require("body-parser");
var puppeteer = require('puppeteer')


//Verbindung zur Datenbank
const connection = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "root",
    database: "carvart",
    charset: "UTF8MB4_BIN",
});

//Express Server
const app = express();
app.use(cors());

//Wird benötigt, um bei Posts Parameter mitgeben zu können 
app.use(bodyParser.json());

//Verbindung zur Datenbank
connection.connect(function (err) {
    if (err) {
        throw err;
    }
});

//Sendet dem Frontend alle Marken aus der Datenbank, damit diese da im Select angezeigt werden können
app.get("/getMakes", function (request, response) {
    const aMakes = []
    connection.query("SELECT * FROM makes", function (error, results, fields) {
        if (results.length > 0) {
            for (i = 0; i < results.length; i++) {
                aMakes.push({
                    id: results[i].ID,
                    make: results[i].Make,
                    arrayLength: results.length,
                    idOnMobile: results[i].IDOnMobile
                });
            }
            response.send(aMakes);
        }
    });
});

app.get("/getModels", function (request, response) {
    const sMake = request.query.sMake.toLowerCase();
    // const sMakeLowerCase = sMake.toLowerCase
    const aModels = [];
    connection.query("SELECT * FROM " + [sMake.replace(/ |-/g, "")], function (error, results, fields) {
        if (results.length > 0) {
            for (i = 0; i < results.length; i++) {
                aModels.push({
                    id: results[i].id,
                    model: results[i].model,
                    idOnMobile: results[i].idOnMobile
                });
            }
            response.send(aModels);
        }
    });
});

/*Kriegt die Suchkriterien vom frontend und sucht dann mit Hilfe von Puppeteer
nach Autos mit diesen Suchkriterien*/
app.get("/getCarsFromMobile", async (request, response) => {

    const sMake = request.query.make; 
    const sModel = request.query.model;
    const iPriceFrom = request.query.priceFrom;
    const iPriceTo = request.query.priceTo;
    const iFirstRegestration = request.query.firstRegistration;
    const sFuelType = request.query.fuelType;
    console.log(iFirstRegestration);

    //Erstellt einen Puppeteer Browser, ruft die Mobile Such Seite auf und gibt die Suchkriterien ein 
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto("https://suchen.mobile.de/fahrzeuge/search.html?vc=Car&dam=0&ref=quickSearch&sfmr=false", { waitUntil: 'networkidle2' });
    await page.click('button[class="sc-bdnxRM dftWVJ mde-consent-accept-btn"]');
    if (sMake.length > 0){
        await page.select("select#selectMake1-ds", sMake);
    };
    if (sModel.length > 0){
        await page.select("select#selectModel1-ds", sModel);
    };
    if (iPriceFrom.length > 0){
        await page.select("select#minPrice-s", iPriceFrom);
    };
    if (iPriceTo.length > 0){
        await page.select("select#maxPrice-s", iPriceTo);
    };
    if (iFirstRegestration > 0){
        await page.select("select#minFirstRegistrationDate-s", iFirstRegestration);
    };
    if (sFuelType == "Benzin"){
        await page.click("#fuels-PETROL-ds")
    };


    await page.click("#dsp-lower-search-btn");

    console.log("kommt hier an")
    response.send(200) 
});

//Vorübergehend um Marken von Mobile auszulesen, baustein um selbes mit den Modellen noch zu machen
app.get("/saveMakes", async (request, response) => {

    //Erstellt einen Puppeteer Browser und ruft die Mobile Such Seite auf
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto("https://suchen.mobile.de/fahrzeuge/search.html?vc=Car&dam=0&ref=quickSearch&sfmr=false", { waitUntil: 'networkidle2' });
    await page.click('button[class="sc-bdnxRM dftWVJ mde-consent-accept-btn"]');
    //Sucht den Select aus und identifiziert die Länge um die Marken später in die DB zu mappen
    const oSelectLength = await page.evaluate(() => {
        const oSelect = document.getElementById("selectMake1-ds");
        return oSelect.length;
    });

    //Kriegt die ganzen Marken (Options) aus dem Select und pusht sie in ein Array
    const aMakes = await page.evaluate(() => {
        const aReadedMakes = [];
        const oSelect = document.getElementById("selectMake1-ds");
        const aOptions = oSelect.getElementsByTagName("option");
        let i = 0;
        while (i < aOptions.length) {
            aReadedMakes.push({
                "make": aOptions[i].textContent,
                "value": aOptions[i].value,
                "lengthOfSelect": oSelect.length
            });
            i += 1; 
        }
        return aReadedMakes;
    });
    const aReadedMakes = Object.values(aMakes);
    var i =  0;
    do {
        i += 1;
        console.log( aReadedMakes[i].value);
        await page.select("select#selectMake1-ds", aReadedMakes[i].value);
        await page.waitForFunction(() => document.querySelector('#selectModel1-ds').length > 0);
        const aModels = await page.evaluate(() => {
            const aReadedModels = [];
            const oSelectModels = document.getElementById("selectModel1-ds");
            const aOptionsModels = oSelectModels.getElementsByTagName("option");
            let j = 0;
            while (j < aOptionsModels.length) {
                aReadedModels.push({   
                    "model": aOptionsModels[j].textContent,
                    "value": aOptionsModels[j].value
                });
                j += 1; 
            }
            return aReadedModels;
        });
        // const aReadedModels = [];
        // let oModelSelect = await page.$('selectModel1-ds');
        // let value = await page.evaluate(el => el.textContent, oModelSelect);
        // console.log(value)
        
        const aReadedModels = Object.values(aModels);
        const iLengthOfModelsArray = aReadedModels.length;

        var sqlCreate = "CREATE TABLE " + [aReadedMakes[i].make.replace(/ |-/g, "")] + " (id INT AUTO_INCREMENT PRIMARY KEY, model TEXT, idOnMobile TEXT)";
        console.log(sqlCreate);
        connection.query(sqlCreate, function (err, result) {
            if (err) throw err;
        });
        let k = 0;
        do {
            k += 1;
            var sqlInsert = "INSERT INTO " + [aReadedMakes[i].make.replace(/ |-/g, "")] + " (model, idOnMobile) VALUES (" + connection.escape(aReadedModels[k].model) + "," + connection.escape(aReadedModels[k].value)+ ")";
            connection.query(sqlInsert, function (err, result) {
                if (err) throw err;
            });
        } while(k < iLengthOfModelsArray - 1);
    // Mappt die Marken in die DB
    // const aReadedMakes = Object.values(aMakes);
    // var i =  0;
    // do {
    //     i += 1;
    //     console.log(i);
    //     var sql = "INSERT INTO makes (Make, IDOnMobile) VALUES (" + connection.escape(aReadedMakes[i].make) + "," + connection.escape(aReadedMakes[i].value)+ ")";
    //     connection.query(sql, function (err, result) {
    //         if (err) throw err;
    //     });
    
    } while (i < oSelectLength - 1);

    console.log("kommt hier an")
    response.send(200) 
});

// Server läuft auf port 5000
app.listen(5000, function () {
    console.log('CORS-enabled web server listening on port 5000')
  })