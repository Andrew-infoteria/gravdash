//get Led elements
var modal = document.getElementById('myModal');
var wrapper = document.getElementById('wrapper');
var theMarquee = document.getElementById('theMarquee');
var btn = document.getElementById("myBtn");
var id = localStorage['id'] || '0';
var kind = "";
var data ="";
var input ="";
var triggerName ="";
setInterval(function () {document.getElementById("myBtn").click();}, 1000);

btn.onclick = function displayLed() {
    getLatestData(function(tRecords) {
        var dataId = tRecords[0].DataId;
        if (dataId !== id) {
            kind = tRecords[0].Kind;
            data = tRecords[0].Data;
            triggerName = tRecords[0].TriggerName;
            id = tRecords[0].DataId;
            localStorage['id'] = id;
            initInput();
            myMessage = textToLED(input);
            $("#wrapper").fadeIn(1000);
            modal.style.display = "block";
            clearLights();
            furthestLeftPoint = 0 - myMessage.length;
            leftPointer = SCROLLER_LENGTH + 1;
            scroll_count = 2;
        }
    });
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

var getLatestData = function getLatest(callback) {
    $.ajax({
        url: '/api/vLed/last',
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            callback(data);
        }
    });
};

function initInput(){
    if (kind == "Temperature") {
        input = data+"ºC";
    } else if (kind == "Slight movement") {
        input = kind;
    } else if (kind == "Door state"){
        if (data == 1) {
            input = "Door Open";
        } else {
            input = "Door Closed";
        }
    } else {
        input = triggerName;
    }
}

var SCROLLER_LENGTH = 60;
var HEIGHT = 20;
var theInput = $('#theInput');
var fps = 20;
initInput();
var myMessage = textToLED(input);
var leftPointer = SCROLLER_LENGTH + 1;
var rightPointer = 0;
var furthestLeftPoint = 0 - myMessage.length;

function clearLights(){
    var lightsOn = $('.on');
    lightsOn.removeClass('on');
    lightsOn.addClass('off');
}

function setLight(row, col, state){
    var theLight = $('.'+row+'_'+col);
    if (theLight.hasClass('on') && !state) {
        theLight.removeClass('on');
        theLight.addClass('off');
    } else if (theLight.hasClass('off') && state) {
        theLight.removeClass('off');
        theLight.addClass('on');
    }
}

function drawMessage(messageArray, leftPointer){
    var messageLength = messageArray.length;
    var totalScrollLength = SCROLLER_LENGTH + messageLength;
    if(messageLength>0){
        for(var col=0;col<messageLength;col++){
            for(var row=0;row<HEIGHT;row++){
                var offsetCol = leftPointer + col;

                if(offsetCol<SCROLLER_LENGTH || offsetCol >= 0){
                    setLight(row,offsetCol,messageArray[col][row]);
                }
            }
        }
    }
}

function textToLED(theWord){
    var theMessage = [];
    //theWord = theWord.toUpperCase();
    for(var i=0;i<theWord.length;i++){
        theMessage.push(charToLED(theWord.charAt(i)));
        theMessage.push(charToLED());
    }
    var flatten = [];
    flatten = flatten.concat.apply(flatten, theMessage);
    return flatten;
}

function charToLED(theChar){
    var theLed = [];
    switch(theChar){
        case 'A' :
        theLed = [[false, false, true, true, true, true, true],
        [false, true, false, false, true, false, false],
        [true, false, false, false, true, false, false],
        [false, true, false, false, true, false, false],
        [false, false, true, true, true, true, true]];
        break;
        case 'B' :
        theLed = [[true, true, true, true, true, true, true],
        [true, false, false, true, false, false, true],
        [true, false, false, true, false, false, true],
        [true, false, false, true, false, false, true],
        [false, true, true, false, true, true, false]];
        break;
        case 'C' :
        theLed = [[false, true, true, true, true, true, false],
        [true, false, false, false, false, false, true],
        [true, false, false, false, false, false, true],
        [true, false, false, false, false, false, true],
        [false, true, false, false, false, true, false]];
        break;
        case 'D' :
        theLed = [[true, true, true, true, true, true, true],
        [true, false, false, false, false, false, true],
        [true, false, false, false, false, false, true],
        [true, false, false, false, false, false, true],
        [false, true, true, true, true, true, false]];
        break;
        case 'E' :
        theLed = [[true, true, true, true, true, true, true],
        [true, false, false, true, false, false, true],
        [true, false, false, true, false, false, true],
        [true, false, false, true, false, false, true],
        [true, false, false, false, false, false, true]];
        break;
        case 'F' :
        theLed = [[true, true, true, true, true, true, true],
        [true, false, false, true, false, false, false],
        [true, false, false, true, false, false, false],
        [true, false, false, true, false, false, false],
        [true, false, false, false, false, false, false]];
        break;
        case 'G' :
        theLed = [[false, true, true, true, true, true, false],
        [true, false, false, false, false, false, true],
        [true, false, false, false, false, false, true],
        [true, false, false, false, true, false, true],
        [true, true, false, false, true, true, true]];
        break;
        case 'H' :
        theLed = [[true, true, true, true, true, true, true],
        [false, false, false, true, false, false, false],
        [false, false, false, true, false, false, false],
        [false, false, false, true, false, false, false],
        [true, true, true, true, true, true, true]];
        break;
        case 'I' :
        theLed = [[false, false, false, false, false, false, false],
        [true, false, false, false, false, false, true],
        [true, true, true, true, true, true, true],
        [true, false, false, false, false, false, true],
        [false, false, false, false, false, false, false]];
        break;
        case 'J' :
        theLed = [[false, false, false, false, false, true, false],
        [false, false, false, false, false, false, true],
        [true, false, false, false, false, false, true],
        [true, true, true, true, true, true, false],
        [true, false, false, false, false, false, false]];
        break;
        case 'K' :
        theLed = [[true, true, true, true, true, true, true],
        [false, false, false, true, false, false, false],
        [false, false, true, false, true, false, false],
        [false, true, false, false, false, true, false],
        [true, false, false, false, false, false, true]];
        break;
        case 'L' :
        theLed = [[true, true, true, true, true, true, true],
        [false, false, false, false, false, false, true],
        [false, false, false, false, false, false, true],
        [false, false, false, false, false, false, true],
        [false, false, false, false, false, false, true]];
        break;
        case 'M' :
        theLed = [[true, true, true, true, true, true, true],
        [false, true, false, false, false, false, false],
        [false, false, true, false, false, false, false],
        [false, true, false, false, false, false, false],
        [true, true, true, true, true, true, true]];
        break;
        case 'N' :
        theLed = [[true, true, true, true, true, true, true],
        [false, false, true, false, false, false, false],
        [false, false, false, true, false, false, false],
        [false, false, false, false, true, false, false],
        [true, true, true, true, true, true, true]];
        break;
        case 'O' :
        theLed = [[false, true, true, true, true, true, false],
        [true, false, false, false, false, false, true],
        [true, false, false, false, false, false, true],
        [true, false, false, false, false, false, true],
        [false, true, true, true, true, true, false]];
        break;
        case 'P' :
        theLed = [[true, true, true, true, true, true, true],
        [true, false, false, true, false, false, false],
        [true, false, false, true, false, false, false],
        [true, false, false, true, false, false, false],
        [false, true, true, false, false, false, false]];
        break;
        case 'Q' :
        theLed = [[false, true, true, true, true, true, false],
        [true, false, false, false, false, false, true],
        [true, false, false, false, true, false, true],
        [true, false, false, false, false, true, false],
        [false, true, true, true, true, false, true]];
        break;
        case 'R' :
        theLed = [[true, true, true, true, true, true, true],
        [true, false, false, true, false, false, false],
        [true, false, false, true, false, false, false],
        [true, false, false, true, false, false, false],
        [false, true, true, false, true, true, true]];
        break;
        case 'S' :
        theLed = [[false, true, true, false, false, false, true],
        [true, false, false, true, false, false, true],
        [true, false, false, true, false, false, true],
        [true, false, false, true, false, false, true],
        [true, false, false, false, true, true, false]];
        break;
        case 'T' :
        theLed = [[true, false, false, false, false, false, false],
        [true, false, false, false, false, false, false],
        [true, true, true, true, true, true, true],
        [true, false, false, false, false, false, false],
        [true, false, false, false, false, false, false]];
        break;
        case 'U' :
        theLed = [[true, true, true, true, true, true, false],
        [false, false, false, false, false, false, true],
        [false, false, false, false, false, false, true],
        [false, false, false, false, false, false, true],
        [true, true, true, true, true, true, false]];
        break;
        case 'V' :
        theLed = [[true, true, true, true, true, false, false],
        [false, false, false, false, false, true, false],
        [false, false, false, false, false, false, true],
        [false, false, false, false, false, true, false],
        [true, true, true, true, true, false, false]];
        break;
        case 'W' :
        theLed = [[true, true, true, true, true, true, false],
        [false, false, false, false, false, false, true],
        [false, false, false, false, true, true, false],
        [false, false, false, false, false, false, true],
        [true, true, true, true, true, true, false]];
        break;
        case 'X' :
        theLed = [[true, false, false, false, false, false, true],
        [false, true, true, false, true, true, false],
        [false, false, false, true, false, false, false],
        [false, true, true, false, true, true, false],
        [true, false, false, false, false, false, true]];
        break;
        case 'Y' :
        theLed = [[true, false, false, false, false, false, false],
        [false, true, false, false, false, false, false],
        [false, false, true, true, true, true, true],
        [false, true, false, false, false, false, false],
        [true, false, false, false, false, false, false]];
        break;
        case 'Z' :
        theLed = [[true, false, false, false, false, true, true],
        [true, false, false, false, true, false, true],
        [true, false, false, true, false, false, true],
        [true, false, true, false, false, false, true],
        [true, true, false, false, false, false, true]];
        break;
        case 'a' :
        theLed = [[false, false, false, false, false, true, false],
        [false, false, true, false, true, false, true],
        [false, false, true, false, true, false, true],
        [false, false, true, false, true, false, true],
        [false, false, false, true, true, true, true]];
        break;
        case 'b' :
        theLed = [[true, true, true, true, true, true, true],
        [false, false, false, true, false, false, true],
        [false, false, true, false, false, false, true],
        [false, false, true, false, false, false, true],
        [false, false, false, true, true, true, false]];
        break;
        case 'c' :
        theLed = [[false, false, false, true, true, true, false],
        [false, false, true, false, false, false, true],
        [false, false, true, false, false, false, true],
        [false, false, true, false, false, false, true],
        [false, false, false, false, false, true, false]];
        break;
        case 'd' :
        theLed = [[false, false, false, true, true, true, false],
        [false, false, true, false, false, false, true],
        [false, false, true, false, false, false, true],
        [false, false, false, true, false, false, true],
        [true, true, true, true, true, true, true]];
        break;
        case 'e' :
        theLed = [[false, false, false, true, true, true, false],
        [false, false, true, false, true, false, true],
        [false, false, true, false, true, false, true],
        [false, false, true, false, true, false, true],
        [false, false, false, true, true, false, false]];
        break;
        case 'f' :
        theLed = [[false, false, false, true, false, false, false],
        [false, true, true, true, true, true, true],
        [true, false, false, true, false, false, false],
        [true, false, false, false, false, false, false],
        [false, true, false, false, false, false, false]];
        break;
        case 'g' :
        theLed = [[false, false, true, true, false, false, false],
        [false, true, false, false, true, false, true],
        [false, true, false, false, true, false, true],
        [false, true, false, false, true, false, true],
        [false, true, true, true, true, true, false]];
        break;
        case 'h' :
        theLed = [[true, true, true, true, true, true, true],
        [false, false, false, true, false, false, false],
        [false, false, true, false, false, false, false],
        [false, false, true, false, false, false, false],
        [false, false, false, true, true, true, true]];
        break;
        case 'i' :
        theLed = [[false, false, false, false, false, false, false],
        [false, false, true, false, false, false, true],
        [true, false, true, true, true, true, true],
        [false, false, false, false, false, false, true],
        [false, false, false, false, false, false, false]];
        break;
        case 'j' :
        theLed = [[false, false, false, false, false, true, false],
        [false, false, false, false, false, false, true],
        [false, false, true, false, false, false, true],
        [true, false, true, true, true, true, false],
        [false, false, false, false, false, false, false]];
        break;
        case 'k' :
        theLed = [[true, true, true, true, true, true, true],
        [false, false, false, false, true, false, false],
        [false, false, false, true, false, true, false],
        [false, false, true, false, false, false, true],
        [false, false, false, false, false, false, false]];
        break;
        case 'l' :
        theLed = [[false, false, false, false, false, false, false],
        [true, false, false, false, false, false, true],
        [true, true, true, true, true, true, true],
        [false, false, false, false, false, false, true],
        [false, false, false, false, false, false, false]];
        break;
        case 'm' :
        theLed = [[false, false, true, true, true, true, true],
        [false, false, true, false, false, false, false],
        [false, false, false, true, true, false, false],
        [false, false, true, false, false, false, false],
        [false, false, false, true, true, true, true]];
        break;
        case 'n' :
        theLed = [[false, false, true, true, true, true, true],
        [false, false, false, true, false, false, false],
        [false, false, true, false, false, false, false],
        [false, false, true, false, false, false, false],
        [false, false, false, true, true, true, true]];
        break;
        case 'o' :
        theLed = [[false, false, false, true, true, true, false],
        [false, false, true, false, false, false, true],
        [false, false, true, false, false, false, true],
        [false, false, true, false, false, false, true],
        [false, false, false, true, true, true, false]];
        break;
        case 'p' :
        theLed = [[false, false, true, true, true, true, true],
        [false, false, true, false, true, false, false],
        [false, false, true, false, true, false, false],
        [false, false, true, false, true, false, false],
        [false, false, false, true, false, false, false]];
        break;
        case 'q' :
        theLed = [[false, false, false, true, false, false, false],
        [false, false, true, false, true, false, false],
        [false, false, true, false, true, false, false],
        [false, false, false, true, true, false, false],
        [false, false, true, true, true, true, true]];
        break;
        case 'r' :
        theLed = [[false, false, true, true, true, true, true],
        [false, false, false, true, false, false, false],
        [false, false, true, false, false, false, false],
        [false, false, true, false, false, false, false],
        [false, false, false, true, false, false, false]];
        break;
        case 's' :
        theLed = [[false, false, false, true, false, false, true],
        [false, false, true, false, true, false, true],
        [false, false, true, false, true, false, true],
        [false, false, true, false, true, false, true],
        [false, false, false, false, false, true, false]];
        break;
        case 't' :
        theLed = [[false, false, true, false, false, false, false],
        [true, true, true, true, true, true, false],
        [false, false, true, false, false, false, true],
        [false, false, false, false, false, false, true],
        [false, false, false, false, false, true, false]];
        break;
        case 'u' :
        theLed = [[false, false, true, true, true, true, false],
        [false, false, false, false, false, false, true],
        [false, false, false, false, false, false, true],
        [false, false, false, false, false, true, false],
        [false, false, true, true, true, true, true]];
        break;
        case 'v' :
        theLed = [[false, false, true, true, true, false, false],
        [false, false, false, false, false, true, false],
        [false, false, false, false, false, false, true],
        [false, false, false, false, false, true, false],
        [false, false, true, true, true, false, false]];
        break;
        case 'w' :
        theLed = [[false, false, true, true, true, true, false],
        [false, false, false, false, false, false, true],
        [false, false, false, false, true, true, false],
        [false, false, false, false, false, false, true],
        [false, false, true, true, true, true, false]];
        break;
        case 'x' :
        theLed = [[false, false, true, false, false, false, true],
        [false, false, false, true, false, true, false],
        [false, false, false, false, true, false, false],
        [false, false, false, true, false, true, false],
        [false, false, true, false, false, false, true]];
        break;
        case 'y' :
        theLed = [[false, false, true, true, false, false, false],
        [false, false, false, false, true, false, true],
        [false, false, false, false, true, false, true],
        [false, false, false, false, true, false, true],
        [false, false, true, true, true, true, false]];
        break;
        case 'z' :
        theLed = [[false, false, true, false, false, false, true],
        [false, false, true, false, false, true, true],
        [false, false, true, false, true, false, true],
        [false, false, true, true, false, false, true],
        [false, false, true, false, false, false, true]];
        break;
        case '1' :
        theLed = [[false, false, false, false, false, false, false],
        [false, true, false, false, false, false, true],
        [true, true, true, true, true, true, true],
        [false, false, false, false, false, false, true],
        [false, false, false, false, false, false, false]];
        break;
        case '2' :
        theLed = [[false, true, false, false, false, false, true],
        [true, false, false, false, false, true, true],
        [true, false, false, false, true, false, true],
        [true, false, false, true, false, false, true],
        [false, true, true, false, false, false, true]];
        break;
        case '3' :
        theLed = [[true, false, false, false, false, true, false],
        [true, false, false, false, false, false, true],
        [true, false, false, true, false, false, true],
        [true, false, true, true, false, false, true],
        [true, true, false, false, true, true, false]];
        break;
        case '4' :
        theLed = [[false, false, false, true, true, false, false],
        [false, false, true, false, true, false, false],
        [false, true, false, false, true, false, false],
        [true, true, true, true, true, true, true],
        [false, false, false, false, true, false, false]];
        break;
        case '5' :
        theLed = [[true, true, true, false, false, true, false],
        [true, false, true, false, false, false, true],
        [true, false, true, false, false, false, true],
        [true, false, true, false, false, false, true],
        [true, false, false, true, true, true, false]];
        break;
        case '6' :
        theLed = [[false, true, true, true, true, true, false],
        [true, false, false, true, false, false, true],
        [true, false, false, true, false, false, true],
        [true, false, false, true, false, false, true],
        [false, true, false, false, true, true, false]];
        break;
        case '7' :
        theLed = [[true, false, false, false, false, false, false],
        [true, false, false, false, true, true, true],
        [true, false, false, true, false, false, false],
        [true, false, true, false, false, false, false],
        [true, true, false, false, false, false, false]];
        break;
        case '8' :
        theLed = [[false, true, true, false, true, true, false],
        [true, false, false, true, false, false, true],
        [true, false, false, true, false, false, true],
        [true, false, false, true, false, false, true],
        [false, true, true, false, true, true, false]];
        break;
        case '9' :
        theLed = [[false, true, true, false, false, false, false],
        [true, false, false, true, false, false, true],
        [true, false, false, true, false, false, true],
        [true, false, false, true, false, true, false],
        [false, true, true, true, true, false, false]];
        break;
        case '0' :
        theLed = [[false, true, true, true, true, true, false],
        [true, false, true, false, false, false, true],
        [true, false, false, true, false, false, true],
        [true, false, false, false, true, false, true],
        [false, true, true, true, true, true, false]];
        break;
        case '`' :
        theLed = [[false, false, false, false, false, false, false],
        [true, false, false, false, false, false, false],
        [false, true, false, false, false, false, false],
        [false, false, true, false, false, false, false],
        [false, false, false, false, false, false, false]];
        break;
        case '!' :
        theLed = [[false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false],
        [true, true, true, true, true, false, true],
        [false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false]];
        break;
        case '@' :
        theLed = [[false, true, false, false, true, true, false],
        [true, false, false, true, false, false, true],
        [true, false, false, true, true, true, true],
        [true, false, false, false, false, false, true],
        [false, true, true, true, true, true, false]];
        break;
        case '#' :
        theLed = [[false, false, true, false, true, false, false],
        [true, true, true, true, true, true, true],
        [false, false, true, false, true, false, false],
        [true, true, true, true, true, true, true],
        [false, false, true, false, true, false, false]];
        break;
        case '$' :
        theLed = [[false, false, true, false, false, true, false],
        [false, true, false, true, false, true, false],
        [true, true, true, true, true, true, true],
        [false, true, false, true, false, true, false],
        [false, true, false, false, true, false, false]];
        break;
        case '%' :
        theLed = [[true, true, false, false, false, true, false],
        [true, true, false, false, true, false, false],
        [false, false, false, true, false, false, false],
        [false, false, true, false, false, true, true],
        [false, true, false, false, false, true, true]];
        break;
        case '^' :
        theLed = [[false, false, true, false, false, false, false],
        [false, true, false, false, false, false, false],
        [true, false, false, false, false, false, false],
        [false, true, false, false, false, false, false],
        [false, false, true, false, false, false, false]];
        break;
        case '\&' :
        theLed = [[false, true, true, false, true, true, false],
        [true, false, false, true, false, false, true],
        [true, false, true, false, true, false, true],
        [false, true, false, false, false, true, false],
        [false, false, false, false, true, false, true]];
        break;
        case '*' :
        theLed = [[false, false, true, false, true, false, false],
        [false, false, false, true, false, false, false],
        [false, true, true, true, true, true, false],
        [false, false, false, true, false, false, false],
        [false, false, true, false, true, false, false]];
        break;
        case '(' :
        theLed = [[false, false, false, false, false, false, false],
        [false, false, true, true, true, false, false],
        [false, true, false, false, false, true, false],
        [true, false, false, false, false, false, true],
        [false, false, false, false, false, false, false]];
        break;
        case ')' :
        theLed = [[false, false, false, false, false, false, false],
        [true, false, false, false, false, false, true],
        [false, true, false, false, false, true, false],
        [false, false, true, true, true, false, false],
        [false, false, false, false, false, false, false]];
        break;
        case '+' :
        theLed = [[false, false, false, true, false, false, false],
        [false, false, false, true, false, false, false],
        [false, true, true, true, true, true, false],
        [false, false, false, true, false, false, false],
        [false, false, false, true, false, false, false]];
        break;
        case '-' :
        theLed = [[false, false, false, true, false, false, false],
        [false, false, false, true, false, false, false],
        [false, false, false, true, false, false, false],
        [false, false, false, true, false, false, false],
        [false, false, false, true, false, false, false]];
        break;
        case '=' :
        theLed = [[false, false, true, false, true, false, false],
        [false, false, true, false, true, false, false],
        [false, false, true, false, true, false, false],
        [false, false, true, false, true, false, false],
        [false, false, true, false, true, false, false]];
        break;
        case '_' :
        theLed = [[false, false, false, false, false, false, true],
        [false, false, false, false, false, false, true],
        [false, false, false, false, false, false, true],
        [false, false, false, false, false, false, true],
        [false, false, false, false, false, false, true]];
        break;
        case '[' :
        theLed = [[true, true, true, true, true, true, true],
        [true, false, false, false, false, false, true],
        [true, false, false, false, false, false, true],
        [false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false]];
        break;
        case ']' :
        theLed = [[false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false],
        [true, false, false, false, false, false, true],
        [true, false, false, false, false, false, true],
        [true, true, true, true, true, true, true]];
        break;
        case '{' :
        theLed = [[false, false, false, true, false, false, false],
        [false, true, true, false, true, true, false],
        [true, false, false, false, false, false, true],
        [false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false]];
        break;
        case '}' :
        theLed = [[false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false],
        [true, false, false, false, false, false, true],
        [false, true, true, false, true, true, false],
        [false, false, false, true, false, false, false]];
        break;
        case '|' :
        theLed = [[false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false],
        [true, true, true, true, true, true, true],
        [false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false]];
        break;
        case ':' :
        theLed = [[false, false, false, false, false, false, false],
        [false, true, true, false, true, true, false],
        [false, true, true, false, true, true, false],
        [false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false]];
        break;
        case ';' :
        theLed = [[false, false, false, false, false, false, false],
        [false, true, true, false, true, false, true],
        [false, true, true, false, true, true, false],
        [false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false]];
        break;
        case '\'' :
        theLed = [[false, false, false, false, false, false, false],
        [true, false, true, false, false, false, false],
        [true, true, false, false, false, false, false],
        [false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false]];
        break;
        case '"' :
        theLed = [[false, false, false, false, false, false, false],
        [true, true, true, false, false, false, false],
        [false, false, false, false, false, false, false],
        [true, true, true, false, false, false, false],
        [false, false, false, false, false, false, false]];
        break;
        case '.' :
        theLed = [[false, false, false, false, false, false, false],
        [false, false, false, false, true, true, false],
        [false, false, false, false, true, true, false],
        [false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false]];
        break;
        case ',' :
        theLed = [[false, false, false, false, false, false, false],
        [false, false, false, false, true, false, true],
        [false, false, false, false, true, true, false],
        [false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false]];
        break;
        case '<' :
        theLed = [[false, false, false, true, false, false, false],
        [false, false, true, false, true, false, false],
        [false, true, false, false, false, true, false],
        [true, false, false, false, false, false, true],
        [false, false, false, false, false, false, false]];
        break;
        case '>' :
        theLed = [[false, false, false, false, false, false, false],
        [true, false, false, false, false, false, true],
        [false, true, false, false, false, true, false],
        [false, false, true, false, true, false, false],
        [false, false, false, true, false, false, false]];
        break;
        case '/' :
        theLed = [[false, false, false, false, false, true, false],
        [false, false, false, false, true, false, false],
        [false, false, false, true, false, false, false],
        [false, false, true, false, false, false, false],
        [false, true, false, false, false, false, false]];
        break;
        case '?' :
        theLed = [[false, true, false, false, false, false, false],
        [true, false, false, false, false, false, false],
        [true, false, false, false, true, false, true],
        [true, false, false, true, false, false, false],
        [false, true, true, false, false, false, false]];
        break;
        case 'º' :
        theLed = [[false, false, false, false, false, false, false],
        [true, true, true, false, false, false, false],
        [true, false, true, false, false, false, false],
        [true, true, true, false, false, false, false],
        [false, false, false, false, false, false, false]];
        break;
        case '†' :
        theLed = [[false, false, false, false, false, false, false],
        [false, false, true, false, false, false, false],
        [false, true, true, true, true, true, true],
        [false, false, true, false, false, false, false],
        [false, false, false, false, false, false, false]];
        break;
        default:
        theLed = [[false, false, false, false, false, false, false]];
    }
    return theLed;
}

function hide(){
    clearLights();
    fadeOutDisplay();
    modal.style.display = "none";
}

var scroll_count = 2;
function draw() {
    setTimeout(function() {
    requestAnimationFrame(draw);
    if(leftPointer==furthestLeftPoint){
        scroll_count = scroll_count - 1;
        leftPointer = SCROLLER_LENGTH + 1;
        if(scroll_count < 1){
            hide();
        }
    }
    drawMessage(myMessage, leftPointer);
    leftPointer--;
    }, 1000 / fps);
    clearTimeout();
}
// Call once to fix scrolling speed
draw();

// resize Led according to window size
$(window).on("resize", function() {
    var w = window.innerWidth;
    var lightSize = Math.floor(90/100*w/60)-4;
    var wrapperWidth = 60*(lightSize+2);
    var marHeight = 7*(lightSize+2)+1;
    var ele = document.getElementsByClassName('light');
    for (var i = 0; i < ele.length; i++ ) {
        ele[i].style.width = String(lightSize)+"px";
        ele[i].style.height = String(lightSize)+"px";
    }
    wrapper.style.width = String(wrapperWidth)+"px";
    theMarquee.style.height = String(marHeight)+"px";
}).resize();
