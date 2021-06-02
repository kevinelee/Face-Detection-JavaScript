const video = document.getElementById("video");

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceExpressionNet.loadFromUri("/models"),
]).then(startVideo);

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    (stream) => (video.srcObject = stream),
    (err) => console.error(err)
  );
}

video.addEventListener("play", () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);
  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    // console.log(detections);
    setExpression(detections);
  }, 100);
});

function setExpression(value) {
  if (value.length < 1) {
    return;
  }

  console.log("value", value);

  let { surprised, angry, disgusted, fearful, happy, neutral, sad } =
    value && value[0] && value[0].expressions;

  let colorClass = document.getElementById("color");

  let color = "white"

  if (angry > 0.8) {
    color = "red";
  } else if (disgusted > 0.8) {
    color = "chartreuse";
  } else if (fearful > 0.8) {
    color = "yellow";
  } else if (happy > 0.8) {
    color = "green";
  } else if (neutral > 0.8) {
    color = "black";
  } else if (sad > 0.8) {
    color = "blue";
  } else if (surprised > 0.8) {
    color = "white";
  } else {
    color = "white";
  }

  // var red = Math.floor(angry * 100 + sad * 100 + surprised * 55 + 50 );
  // var green = Math.floor(happy * 100 + neutral * 100 + surprised * 55 + 50);
  // var blue = Math.floor(disgusted * 100 + fearful * 100 + surprised * 55 + 50);

  // var color = "rgb(" + red + "," + green + "," + blue + ")";

  colorClass.textContent = color;

  document.body.style.backgroundColor = color;
  return color;
}
