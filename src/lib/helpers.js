'use strict';


// Module bereitstellen
module.exports = {
  getBody,
  getBodyParams,
  getCookies,
};


//
// getBody()
// Hilfsfunktion zum schnellen Sammeln des kompletten Request Body.
// <- request: IncomingMessage
// <- callback: Function
function getBody(request, callback) {
  // Eingehende Datenstücke als Buffer sammeln
  let body = Buffer.alloc(0);
  request.on('data', function(chunk) {
    body = Buffer.concat([chunk]);
  });

  // Abgeschlossenen Datenempfang behandeln und Callback Funktion aufrufen
  request.on('end', function() {
    callback(null, body);
  });
}


//
// getBodyParams()
// Hilfsfunktion um schnell mittels Callback Funktion ein echtes Objekt auf Basis des eingegangenen
// Query String formatierten Body zu erhalten.
// <- request: IncomingMessage
// <- callback: Function
function getBodyParams(request, callback) {
  // Zunächst die getBody() Funktion verwenden, um den Body als Text zu erhalten
  getBody(request, function(error, body) {
    // Wenn ein Fehler auftreten ist diesen transparent über die Callback Funktion weitergeben
    if (error) {
      callback(error);
      return;
    }

    // Da kein Fehler aufgetreten ist den Body als URLSearchParams parsen und als echtes Objekt im
    // Aufruf der Callback Funktion übergeben
    callback(null, Object.fromEntries(new URLSearchParams(body.toString())));
  });
}


//
// getCookies()
// Automatische Extraktion aller Cookies aus den Header.
// <- request: IncomingMessage
// -> Object
function getCookies(request) {
  // Prüfen, ob überhaupt Cookies an den Server gesandt wurden
  if (request.headers.cookie) {
    // Cookies wie Query Strings behandeln und als URLSearchParams in ein Objekt konvertieren und
    // zurückgeben
    const cookiesRaw = request.headers.cookie.replaceAll('; ', '&');
    return Object.fromEntries(new URLSearchParams(cookiesRaw));
  }

  // Ohne Cookies geben wir ein leeres Objekt zurück
  return {};
}
