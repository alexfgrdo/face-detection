const video = document.getElementById('video');
const models = '/models';

let predictedAges = [];

const startVideo = () => {
  navigator.getUserMedia(
    { video: {} },
    (stream) => (video.srcObject = stream),
    (error) => console.erro(error),
  );
};

const interpolateAgePredictions = (age) => {
  predictedAges = [age].concat(predictedAges).slice(0, 30);
  const averagePredictedAge =
    predictedAges.reduce((total, a) => total + a) / predictedAges.length;

  return averagePredictedAge;
};

video.addEventListener('playing', () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);

  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

    const age = resizedDetections[0].age;
    const gender = resizedDetections[0].gender;

    console.log(resizedDetections);
    const interpolatedAge = interpolateAgePredictions(age);

    document.getElementById('age').innerText = Math.round(interpolatedAge);
    document.getElementById('gender').innerText = gender;
  }, 100);
});

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri(models),
  faceapi.nets.faceLandmark68Net.loadFromUri(models),
  faceapi.nets.faceRecognitionNet.loadFromUri(models),
  faceapi.nets.faceExpressionNet.loadFromUri(models),
  faceapi.nets.ageGenderNet.loadFromUri(models),
]).then(startVideo);
