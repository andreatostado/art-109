





const webcamVideo = document.querySelector("#webcam");

async function startWebcam() {
try {
const stream = await navigator.mediaDevices.getUserMedia({
video: true,
audio: false
});

webcamVideo.srcObject = stream;

} catch (error) {
console.error("Error accessing webcam:", error);
}
}

startWebcam();

