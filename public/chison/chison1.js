document.getElementById("chiraaag").addEventListener("click", function() {
  setTimeout(function() {
    const xhttp = new XMLHttpRequest();

    xhttp.open("GET", `http://localhost:3000/tabless`, false);
    xhttp.send();

    const jsonTable = JSON.parse(xhttp.responseText);

    var chir;
    if (Number(jsonTable) == 1) {
      chir =
        "A user with that email has already registered. Please use a different email.";
      if (!alert(chir)) {
        window.location = "http://localhost:3000/register.html";
      }
    } else {
      chir = "Registered Successfully.";
      if (!alert(chir)) {
        window.location = "http://localhost:3000/profile.html";
      }
    }
  }, 1000);
});
