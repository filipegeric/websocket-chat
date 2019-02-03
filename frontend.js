(function() {
  "use strict";

  const content = document.getElementById("content");
  const input = document.getElementById("input");
  const status = document.getElementById("status");
  const mainForm = document.getElementById("main-form");
  const introForm = document.getElementById("intro-form");

  let myColor = false;

  let myName = false;

  introForm.addEventListener("submit", function(e) {
    e.preventDefault();
    sendNickname();
  });

  document.addEventListener('keypress', function(e) {
    if(e.ctrlKey && e.charCode === 17) {
      content.innerHTML = '';
    }
  });

  document.addEventListener('visibilitychange', function(e) {
    if(document.hidden) {
      document.title = 'Come back please...';
      document.querySelector('link[rel*="icon"]').href = 'alert.png';
    } else {
      document.title = 'WebSockets Chat';
      document.querySelector('link[rel*="icon"]').href = 'favicon.png';
    }
  });

  window.WebSocket = window.WebSocket || window.MozWebSocket;

  if (!window.WebSocket) {
    content.innerHTML = `<p>Sorry, your browser doesn't support websockets`;
    input.style.display = "none";
    document.querySelector("span").style.display = "none";
    return;
  }

  var connection = new WebSocket("ws://127.0.0.1:1337");
  connection.onopen = function() {
    input.disabled = false;
    status.innerText = "Enter your nickname";
  };

  connection.onerror = function(error) {
    console.log("error: ", error);
    content.innerHTML = `<p>Connection failed</p>`;
  };

  connection.onclose = function(e) {
    console.log(e);
    if (!e.wasClean) {
      alert("Something went wrong, connection is closed!");
    }
  };

  connection.onmessage = function(message) {
    try {
      var json = JSON.parse(message.data);
    } catch (e) {
      console.log("Invalid JSON: ", message.data);
      return;
    }

    if (json.type === "color") {
      myColor = json.data;
      status.innerText = myName + ": ";
      status.style.color = myColor;
      input.disabled = false;
      input.focus();
    } else if (json.type === "history") {
      // TODO: refactor to for of
      for (var i = 0; i < json.data.length; i++) {
        addMessage(
          json.data[i].author,
          json.data[i].text,
          json.data[i].color,
          new Date(json.data[i].time)
        );
      }
    } else if (json.type === "message") {
      input.disabled = false;
      addMessage(
        json.data.author,
        json.data.text,
        json.data.color,
        new Date(json.data.time)
      );
      input.focus();
    } else {
      console.log("Invalid type:", json);
    }
  };

  mainForm.onsubmit = function(e) {
    e.preventDefault();
    var msg = input.value;
    if (!msg) {
      return;
    }
    connection.send(msg);
    input.value = "";
    input.disabled = true;
  };

  function addMessage(author, message, color, dt) {
    let oldContent = content.innerHTML;
    dt =
      (dt.getHours() < 10 ? "0" + dt.getHours() : dt.getHours()) +
      ":" +
      (dt.getMinutes() < 10 ? "0" + dt.getMinutes() : dt.getMinutes());

    content.innerHTML =
      `<p><span style="color: ${color}">${author}</span> @ ${dt}: ${message}</p>` +
      oldContent;
  }

  function sendNickname() {
   let nickname = document.getElementById('nickname-input').value;
   if(!nickname) {
     return;
   }
   connection.send(nickname);
   myName = nickname;
   document.getElementById('intro').style.display = 'none';
   document.getElementById('main-content').style.display = 'block';
  }
})();
