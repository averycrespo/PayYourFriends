var char_count_flag = false;
var cvv_long_enough = false;
var date_flag = false;
var validAmtFlag = false;
var unmasked = '';
var numberFlag = false;

function previewImage(event) {
    var input = event.target;
    var image = document.getElementById('preview');
    if (input.files && input.files[0]) {
       var reader = new FileReader();
       reader.onload = function(e) {
          image.src = e.target.result;
       }
       reader.readAsDataURL(input.files[0]);
    }
 }

//Submission portion for the form
document.addEventListener('DOMContentLoaded', function() {
    var form = document.getElementById("myForm");
    form.addEventListener("submit", function(event) {
        event.preventDefault();
        
        //10 characters
        if(char_count_flag == false) {
            alert("Message must be at least 10 characters long.");
            return;
        } else if(date_flag == false) {
            alert("Invalid expiration date provided.");
            return;
        } else if(cvv_long_enough == false) {
            alert("Invalid CCV provided (3-4 digits).");
            return;
        } else if(validAmtFlag == false) {
            alert("Invalid amount provided.");
            return;
        }
        else if(numberFlag == false) {
            alert("Invalid card number");
            return;
        }

        var options = document.getElementsByName('options');
        var selectedOption = null;

        for (var i = 0; i < options.length; i++) {
            if (options[i].checked) {
            selectedOption = options[i].value;
                break;
            }
        }
         //b1 b2 or b3 
        // const formData = {
            const formData = new FormData();
            formData.append('firstSender', document.getElementById('first-name-s').value);
            formData.append('lastSender', document.getElementById('last-name-s').value);
            formData.append('firstRecip', document.getElementById('first-name-r').value);
            formData.append('lastRecip', document.getElementById('last-name-r').value);
            formData.append('message', document.getElementById('message_input').value);
            formData.append('option', selectedOption);
            formData.append('email', document.getElementById('email-r').value);
            formData.append('phonenumber', document.getElementById('phonenumber-r').value);
            formData.append('cardType', document.getElementById('card-type').value);
            formData.append('cardNum', document.getElementById('card').value);
            formData.append('cardExp', document.getElementById('expiration').value);
            formData.append('cardCCV', unmasked);
            formData.append('amountInput', document.getElementById('amountInput').value);
            formData.append('agreed', document.getElementById('checkbox').checked);
        //     firstSender: document.getElementById('first-name-s').value,
        //     lastSender: document.getElementById('last-name-s').value,
        //     firstRecip: document.getElementById('first-name-r').value,
        //     lastRecip: document.getElementById('last-name-r').value,
        //     message: document.getElementById('message_input').value,
        //     option: selectedOption,
        //     email: document.getElementById('email-r').value,
        //     phonenumber: document.getElementById('phonenumber-r').value,
        //     cardType: document.getElementById('card-type').value,
        //     cardNum: document.getElementById('card').value,
        //     cardExp: document.getElementById('expiration').value,
        //     cardCCV: unmasked,
        //     amountInput: document.getElementById('amountInput').value,
        //     agreed: document.getElementById('checkbox').checked
        // };

        const fileInput = document.getElementById('file-input');
        const file = fileInput.files[0]; 
        formData.append('image', file);

        //json objects
        // const jsonObject = JSON.stringify(formData);
       
        let xhr = new XMLHttpRequest();
        xhr.open('POST', '/submit');
        // xhr.setRequestHeader('Content-Type', 'application/json');

        //server response 
        xhr.onload = function() {

            if (xhr.status === 200) {
                document.body.innerHTML = xhr.responseText;
                
                
            } else if(xhr.status === 400) {
                document.body.innerHTML = xhr.responseText;
                
            } else {
                console.log("idk");
            }
        };

        xhr.send(formData);


    });
});

//Message Box function to verify that it's at least 10 chars long
//Also requiring the notify recipient options
document.addEventListener('DOMContentLoaded', function() {
    var textarea = document.getElementById("message_input");

    textarea.addEventListener("input", function() {
        var message = textarea.value;
        var m_length = message.length;
        if(m_length > 9) {
            char_count_flag = true;
        } else {
            char_count_flag = false;
        }
    });

    var b1Radio = document.getElementById('b1');
    var emailField = document.getElementById('email-r');
    var b2Radio = document.getElementById('b2');
    var phonenumberField = document.getElementById('phonenumber-r');
    var b3Radio = document.getElementById('b3');

    b1Radio.addEventListener("input", function() {
        console.log("required1");
        if (b1Radio.checked) {
            emailField.required = true;
            phonenumberField.required = false;
        } else {
            emailField.required = false;
        }
    });

    b2Radio.addEventListener("input", function() {
        console.log("required2");
        if (b2Radio.checked) {
            phonenumberField.required = true;
            emailField.required = false;
        } else {
            phonenumberField.required = false;
        }
    });

    b3Radio.addEventListener("input", function() {
        console.log("required3");
        emailField.required = false;
        phonenumberField.required = false;
    });
});

//Verifies CCV length (3-4 digits)
//Verifies date 
document.addEventListener('DOMContentLoaded', function() {
    var ccvListener = document.getElementById('ccv');
    if (ccvListener) {
        ccvListener.addEventListener("input", validateLength);
        ccvListener.addEventListener("keyup", validateLength);
    }

    var exp_var = document.getElementById('expiration');
    
    if (exp_var) {
        exp_var.addEventListener("input", validateDate);
    }

    function validateDate() {
        var date = document.getElementById('expiration').value;
    
        var str = date.split('/');
        var monStr = parseInt(str[0]);
        var dayStr = parseInt(str[1]);
        var yearStr = parseInt(str[2]);
        

        if ( isNaN(monStr) || isNaN(dayStr) || isNaN(yearStr) ) {;
            date_flag = false;
            return;
        }

        var dateObject = new Date(yearStr, monStr-1, dayStr); 
        
        var today = new Date();
        var month = today.getMonth() + 1; 
        var day = today.getDate();
        var year = today.getFullYear();

        
        //today
        if(month === monStr && dayStr === day && year == yearStr) {
            console.log("today");
            date_flag = true;
            return;
        }
       
         if(today.getTime() > dateObject) {
            date_flag = false;
            return;
        } else if(monStr < 1 || monStr > 12) {
            console.log("1");
            date_flag = false;
            return;
        } else if(dayStr > 31 || dayStr < 1) {
            console.log("2");
            date_flag = false;
            return;
        } else if(yearStr < year) {
            console.log("3");
            date_flag = false;
            return;
        } else {
            date_flag = true;
        }
    }


});

//Function responsbile for validating CVV length 3-4 digits
function validateLength(event) {
    var ccvInput = event.target;
    var len = ccvInput.value.length;

    if (len >= 3) {
        cvv_long_enough = true;
    } else {
        cvv_long_enough = false;
    }
}

//Listener for CVV and masks the value
document.addEventListener('DOMContentLoaded', function() {
    var cvvInput = document.getElementById("ccv");
    if (cvvInput) {
        cvvInput.addEventListener('input', maskInput);
    }
});

/** Replaces input with *'s */
function maskInput(event) {
    var input = event.target;
    if(unmasked.length < 4) {
        unmasked += input.value.charAt(input.value.length - 1);
    }
   
    //Prevent non-integer values
    input.value = input.value.replace(/[^\d*]/g, '');
    var maskedInput = input.value.replace(/./g, '*');
    input.value = maskedInput;
}

//Event listener for amount to transfer to person
document.addEventListener('DOMContentLoaded', function() {
    var amountInput = document.getElementById("amountInput");
    if (amountInput) {
        amountInput.addEventListener('input', verifyAmount);
    }
});

//Verifies the amount provided for cash transfer
function verifyAmount(event) {
    var input = event.target;
    var inputValue = parseFloat(input.value); 
    if (inputValue < 0) {
        input.value = 0;
        validAmtFlag = false;
    } else {
        validAmtFlag = true;
    }
}

//Event listener for card number
document.addEventListener('DOMContentLoaded', function() {
    var cardInput = document.getElementById("card");
    if (cardInput) {
        cardInput.addEventListener('input', validateCardNumber);
    }
});

//Associated function for card number 
function validateCardNumber(event) {
    var input = event.target;
    var inputValue = input.value;
    var str = inputValue.replace(/\D/g, '');

    var newStr = '';
    //add dashes so user does not have to 
    for (var i = 0; i < str.length; i++) {
        if ( i % 4 == 0 && i > 0 ) {
            newStr += '-';
        }
        newStr += str.charAt(i);
    }
    input.value = newStr;
    
    if(input.value.length === 19) {
        numberFlag = true;
    }

}