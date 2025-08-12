//Accediendo con fectch a la APi url
// seleccionar el tipo de divisa
//creacion de elemento option y select
//si ocurre un error  lo mostrara(try catch)

const selectDivisa = document.querySelector("#selectDivisa");
const errorDiv = document.querySelector("#error");
const inputMonedas = document.querySelector("#inputMonedas"); // constatnte input
const btnTransformar = document.querySelector("#btnTransformar"); //constante button
const resultadoDiv = document.querySelector("#resultadoDiv");

async function obtenermonedas() {
  try {
    const res = await fetch("https://mindicador.cl/api");
    const data = await res.json();

    // limpiar select antes de agregar opciones
    selectDivisa.innerHTML = "";
    
    const divisas = ["uf","dolar", "euro"];

    divisas.forEach((divisa) => {
        console.log("Procesando divisa:", divisa, data[divisa]);
      if (data[divisa]) {
        const option = document.createElement("option");
        option.value = data[divisa].codigo;
        option.textContent = data[divisa].nombre;
        selectDivisa.appendChild(option);
      }
    });
    renderGrafico(selectDivisa.value);

  } catch (e) {
    errorDiv.textContent =
      "Ocurrió un error al obtener las monedas: " + e.message;
  }
}

// escucha del boton "addeventlistener"
//tomar el valor del input y del valor select
//hacer un fecth a la api
//conversion de la moneda
//mostrar relustado con to fixed(2)para dos decimales
//muestra error  si algo sale mal

 // constante del div resultado

btnTransformar.addEventListener("click", async () => {
  const pesosCLP = Number(inputMonedas.value);
  const monedaSeleccionada = selectDivisa.value;

  // validar entrada
  if (!pesosCLP || pesosCLP <= 0) {
    resultadoDiv.textContent = "por favor ingresar un valor mayor a 0";
    return;
  }
  try {
    const res = await fetch("https://mindicador.cl/api");
    const data = await res.json();
    const indicador = Object.values(data).find(m => m.codigo === monedaSeleccionada);
    if (!indicador) {
      resultadoDiv.textContent="No se pudo encontrar la moneda seleccionada.";
      return;
    }
    const valorMoneda = indicador.valor;
    const resultado = pesosCLP / valorMoneda;

    resultadoDiv.innerHTML = `<p>${pesosCLP.toLocaleString(
      "es-CL"
    )} CLP Equivalen a <strong>${resultado.toFixed(
      2
    )}</strong> ${monedaSeleccionada.toUpperCase()}</p>`;
    renderGrafico(monedaSeleccionada);
  } catch (e) {
    errorDiv.textContent = `Error al hacer la conversion: ${e.message}`;
  }
});
selectDivisa.addEventListener("change", () => {
  renderGrafico(selectDivisa.value);
});

async function renderGrafico(monedaCodigo) {
  try {
    const res = await fetch(`https://mindicador.cl/api/${monedaCodigo}`);
    const data = await res.json();

    const ultimos10 = data.serie.slice(0, 10).reverse();

    const labels = ultimos10.map(d => {
      const fecha = new Date(d.fecha);
      return fecha.toLocaleDateString("es-CL");
    });

    const valores = ultimos10.map(d => d.valor);

    const config = {
      type: "line",
      data: {
        labels: labels,
        datasets: [{
          label: `Valor en ${monedaCodigo.toUpperCase()}`,
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          data: valores,
        }]
      }
    };

    // Destruir gráfico anterior si existe
    if (window.miGrafico) {
      window.miGrafico.destroy();
    }

    const canvas = document.getElementById("grafico");
    window.miGrafico = new Chart(canvas, config);

  } catch (e) {
    errorDiv.textContent = "Error al cargar el gráfico: " + e.message;
  }
}
obtenermonedas();