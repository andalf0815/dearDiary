"use strict";

// Module einbinden
const crypto = require("crypto");
const fs = require("fs");
const http = require("http");
const { getBody, getBodyParams, getCookies } = require("./lib/helpers.js");

// Statische Daten einbinden
const accesslist = require("./config/accesslist.json");
const config = require("./config/config.json");
const mimetypes = require("./config/mimetypes.json");
const users = require("./data/users.json");

// Runtime
const sessions = Object.create(null);
const sessionTimeouts = {};
const snippetMatcher = /\{\{(?<code>.*?)\}\}/gs;

// Webserver erstellen
const server = http.createServer(function (request, response) {
  // URL der Anfrage vorbereiten und direkt im Request wieder speichern
  request.url = new URL(request.url, "http://localhost");

  /*******************************************/
  /* SESSION WIEDERHERSTELLEN UND VERLÄNGERN */
  /*******************************************/

  // Session des Benutzers abfragen (falls sie existiert)
  const { sessionID } = getCookies(request);
  const session = sessions[sessionID];

  // Wenn eine Session existiert, dann verlängern wir diese um einen weiteren Gültigkeitszeitraum
  if (session) {
    // Aktuell laufenden Timeout zum automatischen Löschen der Session stoppen
    clearTimeout(sessionTimeouts[session.username]);

    // Einen neuen Timeout zum automatischen Löschen der Session starten
    sessionTimeouts[session.username] = setTimeout(function () {
      delete sessions[sessionID];
    }, 60 * 1000 * config.session.duration);

    // Session Cookie mit der verlängerten Ablaufdauer setzen
    response.setHeader(
      "Set-Cookie",
      `sessionID=${sessionID}; Max-Age=${
        60 * config.session.duration
      }; HttpOnly`
    );
  }

  /*************************************************/
  /* ENDPUNKTE FÜR LOGIN, LOGOUT UND REGISTRIERUNG */
  /*************************************************/

  //
  // Login Endpunkt
  // POST /?login
  if (
    request.url.pathname === "/" &&
    request.url.searchParams.get("login") === "" &&
    request.method === "POST"
  ) {
    // Eingehenden Body als Query String sammeln und verarbeiten
    getBodyParams(request, function (error, params) {
      // Fehler beim Sammeln des Body mit dem Status Code 500 (Internal Server Error) beantworten
      if (error) {
        response.statusCode = 500;
        response.end();
        return;
      }

      // Prüfen, dass die gesendeten Daten einen Benutzernamen sowie ein Passwort enthalten sowie
      // innerhalb der Zeichenlimits für Zugangsdaten sind. Bei Problemen antworten wir mit einem
      // Status Code 400 (Bad Request)
      if (
        !params.username ||
        params.username.length < config.users.limits.username.min ||
        params.username.length > config.users.limits.username.max ||
        !params.password ||
        params.password.length < config.users.limits.password.min ||
        params.password.length > config.users.limits.password.max
      ) {
        response.statusCode = 400;
        response.end();
        return;
      }

      // Benutzername und Passwort aus dem geparsten Body der Anfrage extrahieren
      let { username, password } = params;

      // Das Passwort hashen, sodass wir es mit dem gespeicherten Passwort vergleichen können. Der
      // Hash setzt sich zusammen aus dem Benutzernamen, seinem Passwort sowie dem globalen Hash,
      // sodass daraus keine Rückschlüsse durch Angriffe Rainbow Tables gewonnen werden können.
      password = crypto
        .createHash(config.crypto.hash)
        .update(`${username}:${password}:${config.crypto.salt}`)
        .digest("hex");

      // Prüfen, ob der Benutzer nicht existiert oder das Passwort falsch ist und mit dem Status
      // Code 403 (Forbidden) antworten
      if (!users[username] || users[username].password !== password) {
        response.statusCode = 403;
        response.end();
        return;
      }

      // An dieser Stelle angelangt wissen wir nun, dass ein registrierter Benutzer sich mit seinem
      // korrekten Passwort am Server angemeldet hat

      // Sollte der Benutzer noch keine Session haben, weil er bereits angemeldet ist, dann
      // erstellen wir nun eine neue Session inklusive Cookie
      if (!session) {
        // Session ID zufällig generieren
        const sessionID = crypto
          .randomBytes(config.session.signs / 2)
          .toString("hex");

        // Benutzerprofil aus der Users Datenbank in die Session mit der generierten ID speichern
        sessions[sessionID] = users[username];

        // Timeout zum automatischen Ablaufen der Session erstellen
        sessionTimeouts[username] = setTimeout(function () {
          delete sessions[sessionID];
        }, 60 * 1000 * config.session.duration);

        // Session ID mittels Cookie, welches ein Ablaufdatum hat sowie nicht per JavaScript ausge-
        // lesen werden darf, an den Client senden
        response.setHeader(
          "Set-Cookie",
          `sessionID=${sessionID}; Max-Age=${
            60 * config.session.duration
          }; HttpOnly`
        );
      }

      // Anfrage des Benutzers an die Startseite nach dem Login weiterleiten
      response.statusCode = 302;
      response.setHeader("Location", config.session.homepage);

      // Anfrage abschließen
      response.end();
    });

    // Dieser Endpunkt ist eine in sich geschlossene Einheit und die Anfrage wurde beantwortet
    return;
  }

  //
  // Logout Endpunkt
  // GET /?logout
  if (
    request.url.pathname === "/" &&
    request.url.searchParams.get("logout") === "" &&
    request.method === "GET"
  ) {
    // Nur wenn der Benutzer eine Session hat diese Löschen, was zB nicht der Fall ist, wenn ein
    // nicht angemeldeter Benutzer den Logout Endpunkt ansteuert
    if (session) {
      // Timeout zum automatischen Ablaufen der Session löschen
      clearTimeout(sessionTimeouts[session.username]);
      delete sessionTimeouts[session.username];

      // Session Inhalt löschen
      delete sessions[sessionID];
    }

    // Dem Client mitteilen, dass dieser sein Session Cookie löschen soll, indem wir die Lebensdauer
    // des Cookie auf 0 setzen
    response.setHeader("Set-Cookie", "sessionID=; Max-Age=0; HttpOnly");

    // Anfrage des Benutzers nach dem Logout zur Anmeldeseite weiterleiten
    response.statusCode = 302;
    response.setHeader("Location", "/");
    response.end();

    // Dieser Endpunkt ist eine in sich geschlossene Einheit und die Anfrage wurde beantwortet
    return;
  }

  //
  // Register Endpunkt
  // POST /?register
  if (
    request.url.pathname === "/" &&
    request.url.searchParams.get("register") === "" &&
    request.method === "POST"
  ) {
    // Eingehenden Body als Query String sammeln und verarbeiten
    getBodyParams(request, function (error, params) {
      // Fehler beim Sammeln des Body mit dem Status Code 500 (Internal Server Error) beantworten
      if (error) {
        response.statusCode = 500;
        response.end();
        return;
      }

      // Prüfen, dass die gesendeten Daten einen Benutzernamen sowie ein Passwort enthalten sowie
      // innerhalb der Zeichenlimits für Zugangsdaten sind. Bei Problemen antworten wir mit einem
      // Status Code 400 (Bad Request) antworten
      if (
        !params.username ||
        params.username.length < config.users.limits.username.min ||
        params.username.length > config.users.limits.username.max ||
        !params.password ||
        params.password.length < config.users.limits.password.min ||
        params.password.length > config.users.limits.password.max
      ) {
        response.statusCode = 400;
        response.end();
        return;
      }

      // Benutzername und Passwort aus dem geparsten Body der Anfrage extrahieren
      let { username, password } = params;

      // Wenn der Benutzer bereits existiert mit dem Status Code 409 (Conflict) antworten
      if (users[username]) {
        response.statusCode = 409;
        response.end();
        return;
      }

      // Neue zufällige ID für den Benutzer generieren
      const id = crypto.randomUUID();

      // Das Passwort hashen, da wir niemals Passwörter im Klartext auf der Server speichern! Der
      // Hash setzt sich zusammen aus dem Benutzernamen, seinem Passwort sowie dem globalen Hash,
      // sodass daraus keine Rückschlüsse durch Angriffe Rainbow Tables gewonnen werden können.
      password = crypto
        .createHash(config.crypto.hash)
        .update(`${username}:${password}:${config.crypto.salt}`)
        .digest("hex");

      // Neuen Eintrag für den zu registrierenden Benutzer in der Users Datenbank erstellen
      users[username] = {
        id,
        groups: [],
        username,
        password,
      };

      // Die Users Datenbank speichern und dem Benutzer entsprechend antworten
      fs.writeFile(
        "data/users.json",
        JSON.stringify(users, null, 2),
        function (error) {
          // Wenn ein Fehler beim Speichern der Datenbank auftritt dem Benutzer mit dem Status Code
          // 500 (Internal Server Error) antworten
          if (error) {
            response.statusCode = 500;
            response.end();
            return;
          }

          // Die erfolgreiche Registrierung mit dem Status Code 302 beantworten und
          // Den User an die Index Seite weiterleiten
          response.statusCode = 302;
          response.setHeader("Location", "index.html");

          // Anfrage abschließen
          response.end();
          return;
        }
      );
    });

    // Dieser Endpunkt ist eine in sich geschlossene Einheit und die Anfrage wurde beantwortet
    return;
  }

  /*********************/
  /* WEITERE ENDPUNKTE */
  /*********************/

  // Eigene Endpunkte hier einbinden

  /*******************************************************/
  /* HTTP METHODE PRÜFEN UND INDEX.HTML DATEIEN ERGÄNZEN */
  /*******************************************************/

  // Da die Endpunkte nun bearbeitet wurden sind wir im Bereich des reinen Fileservers, welcher nur
  // GET und HEAD Anfragen beantwortet. Alle anderen Anfragen werden explizit nicht unterstützt.
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.statusCode = 405;
    response.end();
    return;
  }

  // Anfragen welche direkt mit / enden als Anfrage auf die entsprechende index.html (Login) Datei behandeln
  // Sollte eine gültige Session bestehen, dann gleich auf die homepage weiterleiten (Aktuell eingeloggter User versucht die Login page aufzurufen)
  if (request.url.pathname.endsWith("/")) {
    if (!session) {
      request.url.pathname += "index.html";
    } else {
      // Wenn der User gerade eingeloggt ist, dann seine Anfrage an die Index Seite direkt an die homepage weiterleiten
      response.statusCode = 302;
      response.setHeader("Location", config.session.homepage);

      // Anfrage abschließen
      response.end();
      return;
    }
  }

  console.log("session", session);

  /*************************************/
  /* ACCESSLIST: BLOCK, LOGIN, GRUPPEN */
  /*************************************/

  // Zugriff auf alle Dateien der Blocklist mit dem Status Code 403 (Forbidden) verbieten
  if (accesslist.block.includes(request.url.pathname)) {
    response.statusCode = 403;
    response.end();
    return;
  }

  // Zugriff auf alle Dateien, welche einen Login voraussetzen, für nicht angemeldete Benutzer verbieten mit dem Status Code 403 (Forbidden) verbieten
  if (!session && accesslist.login.includes(request.url.pathname)) {
    response.statusCode = 403;
    response.end();
    return;
  }

  // Zugriff auf alle Dateien, welche eine bestimmte Gruppe voraussetzen, mit dem Status Code 403
  // (Forbidden) verbieten
  for (const [group, files] of Object.entries(accesslist.groups)) {
    if (
      files.includes(request.url.pathname) &&
      (!session || !session.groups.includes(group))
    ) {
      response.statusCode = 403;
      response.end();
      return;
    }
  }

  /***********************************************/
  /* DATEIEN VOM DATEISYSTEM AUSLESEN UND SENDEN */
  /***********************************************/

  // Alle Filter sind zu diesem Zeitpunkt durchgelaufen, daher versuchen wir nun konkret die ange-
  // forderte Datei zu laden und damit zu antworten
  fs.readFile(`.${request.url.pathname}`, function (error, file) {
    // Fehler beim Zugriff auf die angeforderte Datei mit dem entsprechenden Status Code beantworten
    if (error) {
      // Datei existiert nicht oder würde sich in einem Ordner befinden, welcher nicht existiert,
      // wird mit dem Status Code 404 (Not Found) beantwortet
      if (error.code === "ENOENT" || error.code === "ENOTDIR") {
        response.statusCode = 404;
        response.end();
        return;
      }

      // Die angeforderte Ressource ist ein Ordner, wofür wir explitit kein Dateianzeige anzeigen
      // wollen, sondern die Anfrage mit dem Status Code 403 (Forbidden) beantworten
      else if (error.code === "EISDIR") {
        response.statusCode = 403;
        response.end();
        return;
      }

      // Alle anderen aufgetretenen Fehler beantworten wir mit dem Status Code 500 (Internal Server
      // Error), sodass der Benutzer weiß, dass etwas schief gelaufen ist, worauf er keinen Einfluss
      // hat
      response.statusCode = 500;
      response.end();
      return;
    }

    // Versuchen den Mimetype der angeforderten Datei auf Basis der Dateiendung zu ermitteln und als
    // Header setzen
    const extension = request.url.pathname.split(".").at(-1);
    const mimetype = mimetypes[extension];
    if (mimetype) {
      response.setHeader("Content-Type", mimetype);
    }

    // Die Ausführung von Snippets in der angeforderten Datei auf Basis ausgewählter Dateiendungen
    // erlauben
    if (config.snippets.includes(extension)) {
      // Zunächst die Datei in einen String umwandeln, da sie bisher noch als Buffer vorliegt
      file = file.toString();

      // Snippet übergreifender geteilter Kontext
      const self = {};

      // Datei nach Snippets durchsuchen, um diese auszuführen
      file = file.replaceAll(snippetMatcher, function () {
        // Gefundenen Code Block aus den Parametern extrahieren (der letzte Parameter der Callback
        // Funktion enthält die named groups des regulären Ausdrucks)
        const { code } = Array.prototype.at.call(arguments, -1);

        // Versuchen das gefundene Snippet auszuführen. Dabei stellen wir den Request, den Response,
        // die Session sowie den Snippet übergreifenden geteilten Kontext zur Verfügung.
        // Sollte das Snippet mit undefined oder null beenden, dann verwenden wir einen leeren Text
        try {
          return (
            new Function(
              "request",
              "response",
              "session",
              "self",
              `${code.includes("\n") ? "" : "return "}${code}`
            )(request, response, session, self) ?? ""
          );
        } catch (error) {
          // Einen Fehler bei der Ausführung des Snippets sowie dessen Code auf der Konsole ausgeben
          // und einen leeren Text für die Stelle des Snippets zurückgeben
          error.cause = `Error in '${request.url.pathname}': ${code.trim()}`;
          console.error(error);
          return "";
        }
      });
    }

    // Anfrage mit der existierenden Datei beantworten
    response.end(file);
  });
});

// Server auf dem angegebenen Port der Konfigurationsdatei starten
server.listen(config.server.port, function () {
  console.log(`Server wurde auf Port ${config.server.port} gestartet`);
});
