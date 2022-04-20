// const translate = require("@iamtraction/google-translate");

const img = document.getElementById("img");

const cargarVoces = () => {
  var voices = speechSynthesis.getVoices();

  const select = document.getElementById("lang");

  for (var i = 0; i < voices.length; i++) {
    var opcion = document.createElement("option");
    opcion.text = voices[i].name + " (" + voices[i].lang + ")";
    select.add(opcion);
  }
};
const reproducirPrediccion = (paramPrediccion) => {
  var msg = new SpeechSynthesisUtterance();

  msg.text = paramPrediccion;
  msg.lang = document.getElementById("lang").value;

  speechSynthesis.speak(msg);

  msg.onend = function (e) {
    console.log("Finished in " + event.elapsedTime + " seconds.");
  };
};

// translate("Tu es incroyable!", { to: "en" })
//   .then((res) => {
//     console.log(res.text); // OUTPUT: You are amazing!
//   })
//   .catch((err) => {
//     console.error(err);
//   });

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

    const select = document.getElementById("lang");

    document.getElementById("lang").addEventListener("click", function () {
      cargarVoces();
    });

    document.getElementById("boton").addEventListener("click", () => {});
  });
});
