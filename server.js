//Import Express dependency
const express = require('express');
//Create new server instance
const app = express();
//Port number
const PORT = 80;

const fs = require('fs');
const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//Designate the *static*/ folder as serving static resources
app.use(express.static( path.join(__dirname, 'static') ));


// templates/form.html/
app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname, 'templates', 'form.html'));
});

/**
 * Pulled from the Express MulterDiskStorage
 * https://expressjs.com/en/resources/middleware/multer.html
 */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        //upload path
      cb(null, path.join(__dirname, 'static', 'uploads'));
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname); //keep name
    }
  });
const upload = multer({ storage: storage });

//Responsible for sending image after validating 
function handleLogicUpload(req, res, next) {
    upload.single('image')(req, res, function(err) {
        if (err) {
            return res.status(500).send('Image rror ');
        }
        // console.log(req.file); 
        
        next();
    });
}

//Get submit form + logic 
app.post('/submit', handleLogicUpload, (req, res) =>  {
    // console.log('form GOT: ', req.body);
    // console.log('file GOT: ', req.file);
    const formData = req.body;
    
    if (req.file && req.file.path) {

    if( !formData|| !formData.firstSender || !formData.lastSender || !formData.firstRecip || !formData.lastRecip ) {
        console.log("1");
        fs.unlinkSync(req.file.path);
        return res.status(400).sendFile(path.join(__dirname, 'templates', 'error.html'));
    } 

    if((formData.firstRecip === "Stuart" && formData.lastRecip === "Dent") || (formData.firstRecip === "Stu" && formData.lastRecip === "Dent")) {
        fs.unlinkSync(req.file.path);
        return res.status(400).sendFile(path.join(__dirname, 'templates', 'error.html'));
    }
    
    if(!formData.message || formData.message.length < 10) {
        console.log("2");
        fs.unlinkSync(req.file.path);
        return res.status(400).sendFile(path.join(__dirname, 'templates', 'error.html'));
    }

    if(!formData.option || formData.agreed == false ) {
        console.log("3");
        fs.unlinkSync(req.file.path);
        return res.status(400).sendFile(path.join(__dirname, 'templates', 'error.html'));
    }

    if((formData.option == "b1" && !formData.email) || (formData.option == "b2" && !formData.phonenumber) || !formData.option) {
        console.log("4");
        fs.unlinkSync(req.file.path);
        return res.status(400).sendFile(path.join(__dirname, 'templates', 'error.html'));
    }

    if(formData.cardCCV.length < 3 || formData.cardCCV.length > 4 || !formData.cardCCV ) {
        console.log("5");
        fs.unlinkSync(req.file.path);
        return res.status(400).sendFile(path.join(__dirname, 'templates', 'error.html'));
    }

    if( !formData.amountInput ) {
        console.log("6");
        fs.unlinkSync(req.file.path);
        return res.status(400).sendFile(path.join(__dirname, 'templates', 'error.html'));
    }

    var c = parseInt(formData.cardCCV);
    if(isNaN(c)) {
        console.log("5.5");
        fs.unlinkSync(req.file.path);
        return res.status(400).sendFile(path.join(__dirname, 'templates', 'error.html'));
    }

    var str = parseFloat(formData.amountInput);
    if(isNaN(str) || str < 0 ) {
        console.log("6.5");
        fs.unlinkSync(req.file.path);
        return res.status(400).sendFile(path.join(__dirname, 'templates', 'error.html'));
    }

    if( !formData.cardType || (formData.cardType !== "Visa" && formData.cardType !== "Mastercard" 
        && formData.cardType !== "Discover" && formData.cardType !== "American Express")) {
            console.log("7");
            fs.unlinkSync(req.file.path);
            return res.status(400).sendFile(path.join(__dirname, 'templates', 'error.html'));
    }

    const cardNum = formData.cardNum
    let p = 0;
    for(var i = 0; i < formData.cardNum.length; i++) {
        if(formData.cardNum[i] === '-') {
            p++;
        }
    }

    if(p != 3 || formData.cardNum.length != 19) {
        console.log("here1");
        fs.unlinkSync(req.file.path);
        return res.status(400).sendFile(path.join(__dirname, 'templates', 'error.html'));
    }

    const section = formData.cardNum.split('-');
    
    for(var i = 0; i < section.length; i++) {
        const sub = section[i];
        const num = parseInt(sub);
        
        if( isNaN(num) ) {
            console.log("here2");
            fs.unlinkSync(req.file.path);
            return res.status(400).sendFile(path.join(__dirname, 'templates', 'error.html'));
        }
    }

    //Expire date foo
    let count = 0;
    for(var i = 0; i < formData.cardExp.length; i++) {
        if(formData.cardExp[i] === '/') {
            count++;
        }
    }
    //valid format 
    if(count != 2) {
        console.log("here3");
        fs.unlinkSync(req.file.path);
        return res.status(400).sendFile(path.join(__dirname, 'templates', 'error.html'));
    }

    var str = formData.cardExp.split('/');
    var monStr = parseInt(str[0]);
    var dayStr = parseInt(str[1]);
    var yearStr = parseInt(str[2]);
        

    if ( isNaN(monStr) || isNaN(dayStr) || isNaN(yearStr) ) {
        fs.unlinkSync(req.file.path);
        return res.status(400).sendFile(path.join(__dirname, 'templates', 'error.html'));
    }

    var dateObject = new Date(yearStr, monStr-1, dayStr); 
        
    var today = new Date();
    var month = today.getMonth() + 1; 
    var day = today.getDate();
    var year = today.getFullYear();
        
        if(month === monStr && dayStr === day && year == yearStr) {
            
        } else {
            if((today.getTime() > dateObject) || (monStr < 1 || monStr > 12)) {
                fs.unlinkSync(req.file.path);
                return res.status(400).sendFile(path.join(__dirname, 'templates', 'error.html'));
            } else if(dayStr > 31 || dayStr < 1) {
                fs.unlinkSync(req.file.path);
                return res.status(400).sendFile(path.join(__dirname, 'templates', 'error.html'));
            } else if(yearStr < year) {
                fs.unlinkSync(req.file.path);
                return res.status(400).sendFile(path.join(__dirname, 'templates', 'error.html'));
            }
        }
    }
        
    //All good
    return res.status(200).sendFile(path.join(__dirname, 'templates', 'success.html'));
});


//Ask our server to listen for incoming connection
app.listen(PORT, () => console.log(`Example app listening on port ${PORT}`));

        