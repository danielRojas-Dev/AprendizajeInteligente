const img = document.getElementById("img");
const select = document.getElementById("lang");
const btnReproducir = document.getElementById("boton");
const archivo = document.getElementById("inputFile");
const formulario = document.getElementById("form");
const divMensaje = document.getElementById("mensaje");
const divMensajeTraducido = document.getElementById("mensajeTraducido");

// event que carga la imagen
archivo.addEventListener("change", (event) => {
  divMensaje.className = "";
  divMensaje.innerHTML = "";
  divMensajeTraducido.className = "";
  divMensajeTraducido.innerHTML = "";
  select.disabled = true;
  btnReproducir.disabled = true;

  const file = event.target.files[0];
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => {
    if (img.src != "") {
      formulario.reset();
    }
    img.src = reader.result;
    img.hidden = false;
    predicciones();
  };
});
//funcion que carga el combo de idiomas
const cargarVoces = () => {
  var voices = speechSynthesis.getVoices();

  for (var i = 0; i < voices.length; i++) {
    var opcion = document.createElement("option");
    opcion.value = voices[i].lang;
    opcion.text = voices[i].name;
    +" " + voices[i].name;
    select.add(opcion);
  }
};

//funcion que reproduce el texto en forma de audio
const reproducirPrediccion = (paramPrediccion) => {
  console.log(paramPrediccion);
  var msg = new SpeechSynthesisUtterance();

  msg.text = paramPrediccion;
  msg.lang = document.getElementById("lang").value;

  speechSynthesis.speak(msg);

  msg.onend = function (e) {
    console.log("Finished in " + event.elapsedTime + " seconds.");
  };
};

const traducirPrediccion = (paramPrediccion) => {
  //obtengo el value del select y corto la cadena para que coincida con el formato del traductor
  const selecValue = select.value;
  let codIdioma = selecValue.substring(0, 2);
  const text = select.options[select.selectedIndex].innerText;
  const textCortado = text.substring(6, 20);

  if (selecValue === "0") {
    const mensaje = document.getElementById("alertSelect");
    mensaje.innerHTML = "Seleccione un idioma";
    mensaje.className = "alert alert-danger form-control";

    setTimeout(() => {
      mensaje.className = "";
      mensaje.innerHTML = ``;
    }, 3000);
  } else {
    const encodedParams = new URLSearchParams();
    encodedParams.append("q", paramPrediccion);
    encodedParams.append("target", codIdioma);
    encodedParams.append("source", "es");

    const options = {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "Accept-Encoding": "application/gzip",
        "X-RapidAPI-Host": "google-translate1.p.rapidapi.com",
        "X-RapidAPI-Key": "352ce007demshb77aba49d6df73dp188a8ajsn2d56ee0065c8",
      },
      body: encodedParams,
    };

    fetch(
      "https://google-translate1.p.rapidapi.com/language/translate/v2",
      options
    )
      .then((response) => response.json())
      .then((response) => {
        const { data } = response;
        const { translations } = data;
        const { translatedText } = translations[0];

        divMensajeTraducido.className =
          "alert alert-warning form-control text-center";

        divMensajeTraducido.innerHTML = `Prediccion Traducida al ${textCortado}: <b> ${translatedText}</b>`;
        reproducirPrediccion(translatedText);
      });
  }
};

const predicciones = () => {
  cocoSsd.load().then((model) => {
    // detect objects in the image.
    model.detect(img).then((predictions) => {
      // console.log(predictions);
      if (predictions.length == 0) {
        divMensaje.className = "alert alert-danger form-control text-center";
        divMensaje.innerHTML = `<b>No se pudo predecir que es el objeto de la imagen.Igrese una nueva imagen</b>`;
        setTimeout(() => {
          divMensaje.className = "";
          divMensaje.innerHTML = ``;
        }, 6000);

        return;
      }

      const { class: clase } = predictions[0];
      divMensaje.className = "alert alert-success form-control text-center";
      divMensaje.style.display = "block";
      divMensaje.innerHTML = `Prediccion: <b>${clase}</b>`;

      select.disabled = false;
      btnReproducir.disabled = false;
    });
  });
};
//evento que instancia a la funcion cargar voces

document.getElementById("lang").addEventListener("click", function () {
  cargarVoces();
});

// parte de marcos

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("inputFile").addEventListener("change", (e) => {
    const file = e.target.files[0];
    obtenerTextoImagen(file);
  });
  cargarModelo();
});
const obtenerTextoImagen = async (imagen) => {
  const path = obtenerPathImagen(imagen);

  const palabras = await obtenerPalabras(path);

  // console.log(palabras);

  const resultClasificacion = await clasificarPalabras(palabras);

  // console.log(resultClasificacion);
  pintarResultadoClasificacion(palabras, resultClasificacion);
  select.disabled = false;
  let palabrita = palabras.join(" ");
  btnReproducir.disabled = false;
  btnReproducir.addEventListener("click", () => {
    traducirPrediccion(palabrita);
  });
};

const resultado = document.getElementById("resultado");
const grafica = document.getElementById("grafica");
const inputFile = document.getElementById("inputFile");
let modelo;

// funcion para cargar el modelo de toxicidad
const cargarModelo = async () => {
  inputFile.disabled = true;
  inputFile;
  resultado.innerHTML = `<p>Estado: Cargando modelo, por favor espere</p>`;
  const limite = 0.9;

  modelo = await toxicity.load(limite);

  resultado.innerHTML = `<p>Estado: Modelo Cargado</p>`;
  inputFile.disabled = false;
};

// funcion para obtener path de imagen
const obtenerPathImagen = (imagen) => {
  const path = window.URL.createObjectURL(imagen);
  return path;
};

// funcion para obtener arreglo de palabras
const obtenerPalabras = async (path) => {
  let {
    data: { text: texto },
  } = await Tesseract.recognize(path, "spa", {
    logger: ({ status, progress }) => {
      resultado.innerHTML = `<p>Estado: ${status} - Porcentaje : ${Math.round(
        progress * 100
      )}%</p>`;
    },
  });

  // quitar los caracteres especiales
  texto = texto.replace(/[^\w\s]/gi, "");

  // separar las palabras por medio del salto de linea
  texto = texto.split("\n").join(" ");
  // separar las palabras por medio del espacio
  texto = texto.split(" ");
  // quitar espacios en blanco
  texto = texto.filter((palabra) => palabra !== "");
  //   console.log(texto);

  return texto;
};

const clasificarPalabras = async (palabras) => {
  resultado.innerHTML = `<p>Estado: Clasificando...</p>`;
  grafica.innerHTML = "";

  const predicciones = await modelo.classify(palabras);

  return predicciones;
};

const pintarResultadoClasificacion = (palabras, predicciones) => {
  // vaciamos el contenido del resultado
  resultado.innerHTML = "";

  // declaramos la cabeza de la tabla
  let tabla = `
    <table class="table">
        <thead>
        <tr>
        <th>Palabra</th>
    `;

  // insertamos los tipos de toxicidad
  predicciones.forEach((prediccion) => {
    tabla += `
        <th scope="col">${prediccion.label}</th>
    `;
  });

  // cerrar la cabeza de la tabla
  tabla += `</tr></thead><tbody>`;

  // recorremos las palabras y hacemos que coincidan con el arreglo de predicciones
  palabras.forEach((palabra, index) => {
    tabla += `<tr> <td>${palabra}</td>`;
    predicciones.forEach(({ results }) => {
      let claseCss = results[index].match ? "bg-success" : "bg-danger";
      let mensaje = results[index].match ? "Si" : "No";
      tabla += `<td class="${claseCss}">${mensaje}</td>`;
    });
    tabla += `</tr>`;
  });
  tabla += `</tbody></table>`;

  grafica.innerHTML = tabla;
};
