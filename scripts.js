// Functie om de URL bij te werken met de huidige instellingen
function updateUrlWithSettings() {
    const totalePunten = document.getElementById("totalePunten").value;
    const nTerm = document.getElementById("nTerm").value;
    const cijferKnik = document.getElementById("cijferKnik").value;
    const puntenStappen = document.getElementById("puntenStappen").value;

    const url = new URL(window.location.href);
    url.searchParams.set("totalePunten", totalePunten);
    url.searchParams.set("nTerm", nTerm);
    url.searchParams.set("cijferKnik", cijferKnik);
    url.searchParams.set("puntenStappen", puntenStappen);

    window.history.replaceState(null, "", url);
}

// Functie om de tabel te exporteren naar een Excel-bestand
function exportToExcel() {
    console.log("Starting export to Excel..."); // Debugging message
    const headers = ["Juiste Antwoorden", "Onjuiste Antwoorden", "Cijfer"];
    const voldoendeRows = Array.from(document.getElementById("voldoende-tabel-body").children);
    const onvoldoendeRows = Array.from(document.getElementById("onvoldoende-tabel-body").children);

    // Controleer of er gegevens zijn om te exporteren
    if (voldoendeRows.length === 0 && onvoldoendeRows.length === 0) {
        console.error("Geen data beschikbaar om te exporteren.");
        alert("Geen data beschikbaar om te exporteren."); // Feedback voor de gebruiker
        return;
    }

    // Maak een array voor de data
    let data = [headers]; // Voeg de headers toe als eerste rij

    // Voeg de "voldoende" rijen toe
    voldoendeRows.forEach(row => {
        const cells = Array.from(row.children).map(cell => cell.innerText);
        data.push(cells);
    });

    // Voeg de "onvoldoende" rijen toe
    onvoldoendeRows.forEach(row => {
        const cells = Array.from(row.children).map(cell => cell.innerText);
        data.push(cells);
    });

    // Maak een nieuwe werkmap en een werkblad
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Pas opmaak toe op de tabelcellen
    ws["!cols"] = [{ width: 20 }, { width: 20 }, { width: 10 }];
    ws["!rows"] = data.map((row, index) => ({
        hpt: index === 0 ? 24 : 18 // Hogere hoogte voor de header
    }));

    // Voeg het werkblad toe aan de werkmap
    XLSX.utils.book_append_sheet(wb, ws, "Cijfer Resultaten");

    // Exporteer als .xlsx-bestand
    XLSX.writeFile(wb, "cijferresultaten.xlsx");
    console.log("Excel export complete."); // Debugging message
}

// Voeg een event listener toe aan de export-knop
document.getElementById("export-csv").addEventListener("click", function() {
    console.log("Export button clicked."); // Debugging message
    // Controleer of de SheetJS-bibliotheek al is geladen
    if (typeof XLSX === "undefined") {
        console.log("Loading SheetJS library..."); // Debugging message
        // Dynamisch de SheetJS-bibliotheek laden als deze nog niet is geladen
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
        script.onload = exportToExcel; // Start de export als de bibliotheek is geladen
        document.head.appendChild(script);
    } else {
        exportToExcel();
    }
});

// Functie om instellingen uit de URL te laden en toe te passen bij het openen van de pagina
function loadSettingsFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const totalePunten = urlParams.get("totalePunten");
    const nTerm = urlParams.get("nTerm");
    const cijferKnik = urlParams.get("cijferKnik");
    const puntenStappen = urlParams.get("puntenStappen");

    // Controleer of alle vereiste parameters aanwezig zijn in de URL
    const heeftWaarden = totalePunten && nTerm && cijferKnik && puntenStappen;
    if (!heeftWaarden) {
        console.log("Geen volledige instellingen in de URL gevonden. Geen automatische submit uitgevoerd.");
        return; // Stop hier als er geen volledige instellingen zijn
    }

    // Pas de instellingen toe als ze aanwezig zijn
    document.getElementById("totalePunten").value = totalePunten;
    document.getElementById("nTerm").value = nTerm;
    document.getElementById("cijferKnik").value = cijferKnik;
    document.getElementById("puntenStappen").value = puntenStappen;
    
    // Voeg actieve klasse toe aan de bijbehorende punten-stappen-knop
    document.querySelectorAll('.punten-stappen-knop').forEach(button => {
        if (button.getAttribute('data-value') === puntenStappen) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });

    // Voer automatisch de berekening uit
    setTimeout(() => {
        document.getElementById("berekenForm").dispatchEvent(new Event("submit"));
    }, 100); // Wacht kort om ervoor te zorgen dat alle instellingen geladen zijn
}

// Functie om de beschrijving van de instellingen te tonen
function toonInstellingenBeschrijving() {
    const totalePunten = document.getElementById("totalePunten").value;
    const nTerm = document.getElementById("nTerm").value;
    const cijferKnik = document.getElementById("cijferKnik").value;
    const puntenStappen = document.getElementById("puntenStappen").value;

    // Haal type en waarde van de N-term op voor beschrijving
    const type = nTerm.replace(/[0-9.,]/g, '');
    const value = parseFloat(nTerm.replace(/[^0-9.,]/g, ''));

    // Stel een beschrijving samen op basis van de gekozen instellingen
    let normeringBeschrijving;
    if (type === 'PL') {
        normeringBeschrijving = `lineair percentage van ${value}%`;
    } else if (type === 'P') {
        normeringBeschrijving = `non-lineair percentage van ${value}%`;
    } else if (type === 'N') {
        normeringBeschrijving = `een normeringsterm van ${value}`;
    } else if (type === 'F') {
        normeringBeschrijving = `fouten per punt met een waarde van ${value}`;
    } else if (type === 'L') {
        normeringBeschrijving = `lineaire punten met een waarde van ${value}`;
    } else {
        normeringBeschrijving = `non-lineaire punten met een waarde van ${value}`;
    }

    // Beschrijvingstekst in de gewenste opmaak
    const beschrijving = `Je hebt ingesteld: een knik bij ${cijferKnik} met ${normeringBeschrijving} over ${totalePunten} haalbare punten.`;

    // Zet de beschrijving in het HTML-element boven de tabel
    const beschrijvingElement = document.getElementById("instellingenBeschrijving");
    if (beschrijvingElement) {
        beschrijvingElement.innerText = beschrijving;
    }
}

// Functie om het cijfer te berekenen
function berekenCijfer(juisteAntwoorden, totalePunten, nTermValue) {
  if (totalePunten <= 0) {
    console.error("Totale punten moeten groter dan 0 zijn.");
    return;
  }

  // Haal het type en de waarde uit de N-term string
  const type = nTermValue.replace(/[0-9.,]/g, '');
  const value = parseFloat(nTermValue.replace(/[^0-9.,]/g, ''));

  let cijfer;

  switch(type) {
    case 'N': // Normale N-term
      cijfer = 9 * (juisteAntwoorden / totalePunten) + value;
      if (value > 1) {
        let grensRelatie1 = 1 + (juisteAntwoorden * (9 / totalePunten) * 2);
        let grensRelatie4 = 10 - ((totalePunten - juisteAntwoorden) * (9 / totalePunten) * 0.5);
        cijfer = Math.min(cijfer, grensRelatie1, grensRelatie4);
      } else if (value < 1) {
        let grensRelatie2 = 1 + (juisteAntwoorden * (9 / totalePunten) * 0.5);
        let grensRelatie3 = 10 - ((totalePunten - juisteAntwoorden) * (9 / totalePunten) * 2);
        cijfer = Math.max(cijfer, grensRelatie2, grensRelatie3);
      }
      break;

    case 'F': // Fouten per punt
      const aantalFouten = totalePunten - juisteAntwoorden;
      const maxFouten = totalePunten * value;
      cijfer = 10 - ((aantalFouten / maxFouten) * 9);
      break;

    case 'PL': // Percentage lineair
      const percentageL = (juisteAntwoorden / totalePunten) * 100;
      cijfer = ((percentageL / value) * 9) + 1;
      break;

    case 'P': // Percentage non-lineair
      const percentageNL = (juisteAntwoorden / totalePunten) * 100;
      if (percentageNL >= value) {
        cijfer = 6 + ((percentageNL - value) / (100 - value)) * 4;
      } else {
        cijfer = 1 + (percentageNL / value) * 5;
      }
      break;

    case 'L': // Punten lineair
      cijfer = ((juisteAntwoorden / value) * 9) + 1;
      break;

    default: // Punten non-lineair (geen prefix)
      if (juisteAntwoorden >= value) {
        cijfer = 6 + ((juisteAntwoorden - value) / (totalePunten - value)) * 4;
      } else {
        cijfer = 1 + (juisteAntwoorden / value) * 5;
      }
      break;
  }

  // Rond af op 1 decimaal en begrens tussen 1 en 10
  cijfer = Math.round(cijfer * 10) / 10;
  if (cijfer > 10) cijfer = 10;
  if (cijfer < 1) cijfer = 1;
  
  return cijfer;
}

// Voeg event listener toe om de instellingen uit de URL te laden bij het laden van de pagina
window.addEventListener("DOMContentLoaded", loadSettingsFromUrl);

document.querySelectorAll('.punten-stappen-knop').forEach(button => {
  button.addEventListener('click', function() {
    document.querySelectorAll('.punten-stappen-knop').forEach(btn => btn.classList.remove('active'));
    this.classList.add('active');
    document.getElementById('puntenStappen').value = this.getAttribute('data-value');
  });
});

document.getElementById("berekenForm").addEventListener("submit", function(event) {
  event.preventDefault();

  // Update de URL met de huidige instellingen
  updateUrlWithSettings();

  // Toon de instellingen beschrijving boven de tabel
  toonInstellingenBeschrijving();

  let totalePunten = parseInt(document.getElementById("totalePunten").value);
  let nTerm = document.getElementById("nTerm").value;
  let cijferKnik = parseFloat(document.getElementById("cijferKnik").value);
  let puntenStappen = parseFloat(document.getElementById("puntenStappen").value);

  document.getElementById("onvoldoende-tabel-body").innerHTML = "";
  document.getElementById("voldoende-tabel-body").innerHTML = "";
  let labels = [];
  let data = [];
  let dataN0 = [];
  let dataN1 = [];
  let dataN2 = [];

  for (let juisteAntwoorden = totalePunten; juisteAntwoorden >= 0; juisteAntwoorden -= puntenStappen) {
    let onjuisteAntwoorden = totalePunten - juisteAntwoorden;
    let resultaat = berekenCijfer(juisteAntwoorden, totalePunten, nTerm);
    let rowHTML = `<tr><td>${juisteAntwoorden}</td><td>${onjuisteAntwoorden}</td><td>${resultaat}</td></tr>`;

    if (resultaat >= cijferKnik) {
      document.getElementById("voldoende-tabel-body").innerHTML += rowHTML;
    } else {
      document.getElementById("onvoldoende-tabel-body").innerHTML += rowHTML;
    }

    labels.push(juisteAntwoorden);
    data.push(resultaat);

    // Bereken vergelijkingslijnen met N-termen 0, 1, en 2
    dataN0.push(berekenCijfer(juisteAntwoorden, totalePunten, "N0.0"));
    dataN1.push(berekenCijfer(juisteAntwoorden, totalePunten, "N1.0"));
    dataN2.push(berekenCijfer(juisteAntwoorden, totalePunten, "N2.0"));
  }

  // Check of er data is
  if (data.length === 0) {
    console.error("Geen data beschikbaar voor de grafiek.");
    return;
  }

  // Check of de chart al bestaat en verwijder deze
  if (window.chart) {
    window.chart.destroy();
  }

  const ctx = document.getElementById('resultaatGrafiek').getContext('2d');
  window.chart = new Chart(ctx, {
      type: 'line',
      data: {
          labels: labels.reverse(),
          datasets: [
              {
                  label: '5.5 Grenslijn',
                  data: Array(labels.length).fill(5.5), 
                  borderColor: 'rgba(255, 165, 0, 0.75)', 
                  borderWidth: 2,
                  borderDash: [5, 5],
                  fill: false,
                  pointRadius: 0 
              },
              {
                  label: `Cijfer met gekozen berekening`,
                  data: data.reverse(),
                  borderColor: 'rgba(0, 77, 127, 1)',
                  backgroundColor: 'rgba(0, 77, 127, 0.2)',
                  fill: true,
                  tension: 0.1
              },
              {
                  label: 'Cijfer met N-term 0',
                  data: dataN0.reverse(),
                  borderColor: 'rgba(255, 99, 132, 1)',
                  backgroundColor: 'rgba(255, 99, 132, 0.2)',
                  fill: false,
                  tension: 0.1
              },
              {
                  label: 'Cijfer met N-term 1',
                  data: dataN1.reverse(),
                  borderColor: 'rgba(54, 162, 235, 1)',
                  backgroundColor: 'rgba(54, 162, 235, 0.2)',
                  fill: false,
                  tension: 0.1
              },
              {
                  label: 'Cijfer met N-term 2',
                  data: dataN2.reverse(),
                  borderColor: 'rgba(75, 192, 192, 1)',
                  backgroundColor: 'rgba(75, 192, 192, 0.2)',
                  fill: false,
                  tension: 0.1
              },
          ]
      },
      options: {
          responsive: true,
          scales: {
              x: {
                  title: {
                      display: true,
                      text: 'Aantal Juiste Antwoorden'
                  }
              },
              y: {
                  title: {
                      display: true,
                      text: 'Cijfer'
                  },
                  min: 1,
                  max: 10
              }
          }
      }
  });

  document.getElementById("export-csv-container").style.display = "block";

});
