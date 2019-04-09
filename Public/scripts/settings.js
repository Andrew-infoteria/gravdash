$('#send').click(function(){
$(':input[type="text"]').filter(function(e){
    if ($(this).val().length==0){
        return true;
    }
}).remove();
    });

var counter = 3;
var limit = 5;
function addInput(divName){
    if (counter == limit)  {
        alert("You have reached the limit of adding " + counter + " inputs");
    }
    else {
        var newtd = document.createElement('td');
        //newdiv.className = 'layerNameField';
        newtd.innerHTML = "Layer Name " + (counter + 1) + ": <input type='text' name='layerNames[]'>";
        document.getElementById(tdName).appendChild(newtd);
        counter++;
    }
}
var counter = 4;
var limit = 8;
function insert(){
    if (counter == limit)  {
        alert("You have reached the limit of adding " + counter + " inputs");
    }
    else {
    var parenttbl = document.getElementById("myrow");
    var newel = document.createElement('td');
    var elementid = document.getElementsByTagName("td").length
    newel.setAttribute('id',elementid);
    newel.innerHTML = "Layer Name " + (counter + 1) + ": <input type='text' name='layerNames[]'>";
    parenttbl.appendChild(newel);
    counter++;
    }
}
