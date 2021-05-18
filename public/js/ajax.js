function ajaxGet(url, callback) {
  var req = new XMLHttpRequest();
  req.open("GET", url, true);
  req.addEventListener("load", function() {
    if (req.status >= 200 && req.status < 400) {
      // Llamada ala función callback pasándole la respuesta
      callback(req.responseText);
    } else {
      console.error(req.status + " " + req.statusText);
    }
  });
  req.addEventListener("error", function(){
    console.error("Error de red");
  });
  req.send(null);
}

function ajaxPost(url, json_object, callback) {
  var req = new XMLHttpRequest();
  req.open("POST", url, true);
  req.addEventListener("load", function() {
    if (req.status >= 200 && req.status < 400) {
      //Llamada a la función callback pasándole la respuesta
      callback(req.response);
    } else {
      console.error(req.status + " " + req.statusText);
    }
  });
  req.addEventListener("error", function(){
    console.error("Error de red");
  });
  req.responseType = 'text';
  if(json_object != null) {
    req.setRequestHeader('Content-type', "application/json");
    req.send(JSON.stringify(json_object));
  } else {
    req.send();
  }
}
