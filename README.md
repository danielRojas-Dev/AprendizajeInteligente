# Aprendizaje Intelegente (TensorFlow)

para iniciar el proyecto, primero ejecutar el siguiente comando en la consola: npm install


## IMPORTANTE
El proyecto cuenta con dos ramas:

main: En esta rama se hace uso el modelo de cocoSSD de TensorFlow y una api para traducir la prediccion que devuelve el modelo, lo que hace es que al ingresar
una imagen lo analiza para hacer una prediccion para determinar que objeto se encuenta en la misma y luego se manda el resultado de la prediccion a la api de traduccion y permite seleccionar un idioma y poder reproducir en forma de voz lo traducido. 

fusionModelosTraductores: En esta rama se hace uso del modelo de toxicidad de tensorFlow, una libreria llamada Tesseract.js y una api de traduccion, lo que hace es que al ingresar una imagen pasa por la libreria Tesseract que analiza la imagen y extrae el texto que contenga para mandarlo al modelo de toxicidad y analizar si contiene palabras ofensivas, luego pasar esa misma cadena de texto a la api de tradccion y permitir seleccionar un lenguaje y reproducirlo en forma de voz.
