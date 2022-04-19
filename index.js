const img = document.getElementById("img");

// Load the model.
const predicciones = cocoSsd.load().then((model) => {
  // detect objects in the image.
  model.detect(img).then((predictions) => {
    console.log(predictions);
    const divMensaje = document.getElementById("mensaje");
    const { class: clase } = predictions[0];
    divMensaje.className = "alert alert-success text-center";
    divMensaje.style = "width: 600px";
    divMensaje.innerHTML = `Prediccion: <b>${clase}</b>`;

    document.getElementById("boton").addEventListener("click", function () {
      cargarVoces(clase).speechSynthesis.speak(clase);
    });
  });
});

const cargarVoces = (paramPrediccion) => {
  var voices = speechSynthesis.getVoices();
  //console.log(voices);
  if (voices.length !== 0) {
    var msg = new SpeechSynthesisUtterance();

    msg.text = paramPrediccion;
    msg.lang = document.getElementById("lang").value; //'hi-IN';

    const select = document.getElementById("lang");

    for (var i = 0; i < voices.length; i++) {
      var opcion = document.createElement("option");
      opcion.text = voices[i].name + " (" + voices[i].lang + ")";
      select.add(opcion);

      // if (voices[i].lang == msg.lang) {
      //   msg.voice = voices[i]; // Note: some voices don't support altering params
      //   msg.voiceURI = voices[i].voiceURI;
      //   // break;
      // }
    }

    msg.onend = function (e) {
      console.log("Finished in " + event.elapsedTime + " seconds.");
    };
  }
};

cargarVoces();
