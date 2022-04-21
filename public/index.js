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
    encodedParams.append("source", "en");

    const options = {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "Accept-Encoding": "application/gzip",
        "X-RapidAPI-Host": "google-translate1.p.rapidapi.com",
        "X-RapidAPI-Key": "5b32519b9cmsh22a61f71af1a9c2p164a15jsn7dd127f82b01",
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

        divMensajeTraducido.className = "alert alert-warning text-center";
        divMensajeTraducido.style = "width: 600px";
        divMensajeTraducido.innerHTML = `Prediccion Traducida al ${textCortado}: <b> ${translatedText}</b>`;
        reproducirPrediccion(translatedText);
      });
  }
};

const predicciones = () => {
  cocoSsd.load().then((model) => {
    // detect objects in the image.
    model.detect(img).then((predictions) => {
      console.log(predictions);
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

      //evento que instancia a la funcion cargar voces

      document.getElementById("lang").addEventListener("click", function () {
        cargarVoces();
      });

      //evento que reproduce el audio con el texto

      document.getElementById("boton").addEventListener("click", () => {
        traducirPrediccion(clase);
      });
    });
  });
};
