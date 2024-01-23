
// DATABASE = college1
// DATABASE_HOST = localhost
// DATABASE_ROOT = root
// DATABASE_PASSWORD = password

const express = require('express');
const mysql = require("mysql");
const dotenv = require('dotenv');
const app = express();
const session = require('express-session');
dotenv.config({ path: './.env'});

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "college1"
})

db.connect((error) => {
    if(error) {
        console.log(error)
    } else {
        console.log("MySQL connected!")
    }
})

app.set('view engine', 'hbs');

const path = require("path")

const publicDir = path.join(__dirname, './public')

app.use(express.static(publicDir))

app.get("/", (req, res) => {
    res.render("index")
})

app.get("/register", (req, res) => {
    res.render("register")
})

app.get("/login", (req, res) => {
    res.render("login")
})

// const bcrypt = require("bcryptjs");
app.use(express.urlencoded({extended: 'false'}))
app.use(express.json())

app.post("/auth/register", (req, res) => {    
    const { name,contact ,email, password,regdate } = req.body;
    console.log(req.body);
    db.query('SELECT email FROM college1.userdata WHERE email = ?', [email], function(error, result)  {
        if(error){
            console.log(error)
        }
         if( result.length > 0 ) {
            return res.render('register', {
                message: 'This email is already in use'
            })
        }

     
    
    db.query('INSERT INTO college1.userdata SET?', {name:name,email:email,contact:contact, password:password,regisdate:regdate}, (err, res) => {
         if(err) {
            console.log(err)
        } 
       if(res.length > 0){
             return res.render('register', {
                message:'registration success' })   
        }
         })
        })
})
// login------------------------------------------------------------------------------------------
app.post("/auth/login", (request, response) => {    
 let name=request.body.name;
 let password=request.body.password;   
if(name && password)
{
db.query('SELECT * FROM college1.userdata WHERE name = ? AND password = ?', [name, password], function(error, results) {
       if (error) throw error
        if (results.length > 0)
         {
            // Authenticate the user
            request.session.loggedin = true;
            request.session.username = name;
            // Redirect to home page
            // response.redirect('/auth/view data');
            response.send('login successfully');
            // response.send()
        }
         else {
            response.send('Incorrect Username and/or Password!');
        }		
        response.end();
    })       
}
else{
   response.send('Please enter Username and Password!');
		response.end();
}
})

// excel line----------------------------------------------------------------------------------------
// const excel = require('exceljs');
// const { error } = require('console');
const xlsx = require("xlsx");
app.get("/view-data", (req, res) => {
    
    res.render("view-data")
})
app.post("/auth/view-data", (request, response) => {
    let date=request.body.date;
db.query("SELECT * FROM college1.userdata where regisdate = ? ",[date],function(error, results) {
    // (C1) EXTRACT DATA FROM DATABASE
    if (error) throw error
    if(results.length > 0){
    var data = [];
    results.forEach(row => {
      data.push([row["name"], row["contact"],row["email"],row["regisdate"]]);
    });


// (C2) WRITE TO EXCEL FILE
var worksheet = xlsx.utils.aoa_to_sheet(data),
workbook = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(workbook, worksheet, "Users");
xlsx.writeFile(workbook, "demo.xlsx");
response.send("data send to excel");
}
});

});

//read excel data and enter in database ----------------------------------------------------------------------------------
app.get("/read-excel-data", (req, res) => {
    
    res.render("read-excel-data");
})

// app.post("/auth/read-excel-data", (request, response) => {
// //    let file=request.body.excel-file;
//     // (C) OPEN EXCEL FILE - USE FIRST WORKSHEET
// var workbook = xlsx.readFile("userexcel.xlsx"),
// worksheet = workbook.Sheets[workbook.SheetNames[0]],
// range = xlsx.utils.decode_range(worksheet["!ref"]);

// // (D) IMPORT EXCEL
// for (let row=range.s.r; row<=range.e.r; row++) {
//     // (D1) READ CELLS
//     let data = [];
//     for (let col=range.s.c; col<=range.e.c; col++) {
//       let cell = worksheet[xlsx.utils.encode_cell({r:row, c:col})];
//       data.push(cell.v);
//     }


// // (D2) INSERT INTO DATABASE
// let sql = "INSERT INTO college1.userdata('name','contact','email','password','regisdate') VALUES (?,?,?,?,?)";
// db.query(sql, data, (err, results) => {
//   if (err) { return console.error(err.message); }
//   console.log("USER ID:" + results.insertId);
//   response.send('data sent from excel to database');
// });
// }

// })

   

// app.listen(5500, ()=> {
// console.log("server started on port 5500");
// })
const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});