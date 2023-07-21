import './style.css'; 
import { NstrumentaBrowserClient } from "nstrumenta/dist/browser/client";

const nstClient = new NstrumentaBrowserClient();
nstClient.connect();

interface HTMLMediaElementWithCaptureStream extends HTMLMediaElement {
  captureStream(): MediaStream;
  mozCaptureStream(): MediaStream;
}

let preview = document.getElementById(
  "preview"
) as HTMLMediaElementWithCaptureStream;
let recording = document.getElementById(
  "recording"
) as HTMLMediaElementWithCaptureStream;
let startButton = document.getElementById("startButton") as HTMLButtonElement;
let stopButton = document.getElementById("stopButton") as HTMLButtonElement;
let downloadButton = document.getElementById(
  "downloadButton"
) as HTMLAnchorElement;

let recordingTimeMS = 5000;

function wait(delayInMS) {
  return new Promise((resolve) => setTimeout(resolve, delayInMS));
}

function startRecording(stream, lengthInMS) {
  let recorder = new MediaRecorder(stream);
  let data: Blob[] = [];

  recorder.ondataavailable = (event) => data.push(event.data);
  recorder.start();
  console.log(`${recorder.state} for ${lengthInMS / 1000} seconds…`);

  let stopped = new Promise((resolve, reject) => {
    recorder.onstop = resolve;
    recorder.onerror = (event: any) => reject(event.name);
  });

  let recorded = wait(lengthInMS).then(() => {
    if (recorder.state === "recording") {
      recorder.stop();
    }
  });

  return Promise.all([stopped, recorded]).then(() => data);
}

function stopStream(stream) {
  stream.getTracks().forEach((track) => track.stop());
}

startButton.addEventListener(
  "click",
  () => {
    navigator.mediaDevices
      .getDisplayMedia({
        video: {
          displaySurface: "window",
        },
        audio: true,
      })
      .then((stream) => {
        preview.srcObject = stream;
        downloadButton.href = stream as unknown as string;
        preview.captureStream =
          preview.captureStream || preview.mozCaptureStream;
        return new Promise((resolve) => (preview.onplaying = resolve));
      })
      .then(() => startRecording(preview.captureStream(), recordingTimeMS))
      .then((recordedChunks) => {
        let recordedBlob = new Blob(recordedChunks, { type: "video/webm" });
        recording.src = URL.createObjectURL(recordedBlob);
        downloadButton.href = recording.src;
        downloadButton.download = `${Date.now()}.webm`;
        nstClient.storage.upload({filename: downloadButton.download, data: recordedBlob, meta: {}});
        console.log(
          `Successfully recorded ${recordedBlob.size} bytes of ${recordedBlob.type} media.`
        );
      })
      .catch((error) => {
        if (error.name === "NotFoundError") {
          console.log("Camera or microphone not found. Can't record.");
        } else {
          console.log(error);
        }
      });
  },
  false
);

stopButton.addEventListener(
  "click",
  () => {
    stopStream(preview.srcObject);
  },
  false
);
