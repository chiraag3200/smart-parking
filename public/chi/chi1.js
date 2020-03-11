document.getElementById("chirag").addEventListener("click", function() {
  setTimeout(function() {
    const xhttp = new XMLHttpRequest();

    xhttp.open("GET", `http://localhost:3000/table`, false);
    xhttp.send();

    const jsonTable = JSON.parse(xhttp.responseText);

    if (Number(jsonTable) == 1) {
      var chir = "Parking booked";
    } else {
      chir =
        "Parking for this time slot is not available.Please try another slot";
    }
    if (!alert(chir)) {
      window.location = "http://localhost:3000/temp.html";
    }
  }, 1000);
});
