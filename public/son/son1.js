document.getElementById("chiraag").addEventListener("click", function() {
  setTimeout(function() {
    const xhttp = new XMLHttpRequest();

    xhttp.open("GET", `http://localhost:3000/tables`, false);
    xhttp.send();

    const jsonTable = JSON.parse(xhttp.responseText);

    var chir;
    if (Number(jsonTable) == 1) {
      chir = "Wrong Password.Please try again.";
      if (!alert(chir)) {
        window.location = "http://localhost:3000/login.html";
      }
    } else {
      chir = "Correct Password";
      if (!alert(chir)) {
        window.location = "http://localhost:3000/temp.html";
      }
    }
  }, 1000);
});
