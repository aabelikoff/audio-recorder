//constructor responcible for media-player

class AudioRecorder {
  #audioRecorderEl;
  #mediaRecorder = null;
  #chunks = [];
  #audioUrl = null;
  #isRecording = false;
  #timer = null;

  constructor() {
    this.timer_value = 0;
    //Creating MediaRecorder
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      this.#mediaRecorder = new MediaRecorder(stream);
      //when we have audio data save it to chunks array
      this.#mediaRecorder.addEventListener(
        "dataavailable",
        function (e) {
          this.#chunks.push(e.data);
        }.bind(this)
      );
      //when we stop recording create url for audio and add it to audio player element
      this.#mediaRecorder.addEventListener(
        "stop",
        function () {
          const blob = new Blob(this.#chunks, { type: "audio/webm" });
          this.#audioUrl = URL.createObjectURL(blob);
          this.audioPlayerEl.querySelector("audio").src = this.#audioUrl;
        }.bind(this)
      );
    });
    //creating audio recorder element
    this.#audioRecorderEl = document.createElement("div");
    this.#audioRecorderEl.classList.add("audio-recorder");
    this.#audioRecorderEl.innerHTML = `
    <h3>Audio Recorder</h3>
    <div class="timer">
      <span>00:00</span>
     </div>
    <div class="controls" data-source='recorder'>
      <div class="controls-btn">
        <button data-control="record" data-process='off'><i class="fa-regular fa-circle"></i></button>
        <button data-control="pause"  class='hidden'><i class="fa-solid fa-pause"></i></button>
      </div>
    </div>`;

    this.controlsRecEl = this.#audioRecorderEl.querySelector(".controls");
    this.timerEl = this.#audioRecorderEl.querySelector(".timer");
    //adding event listeners to controlls buttons
    this.controlsRecEl.addEventListener("click", (e) => {
      const target = e.target;
      const controlType = target.dataset.control;
      switch (controlType) {
        case "record":
          this.toggleRecButton(); //toggle icon on record button
          this.toggleRecControlsButtons(); //toggle pause button to show
          if (!this.#isRecording) {
            this.#mediaRecorder.start(); //starts recording
            this.clearTimer(); //clear timer
            this.startTimer(); //starting timer
            this.audioPlayerEl.classList.add("hidden"); //hide player
            this.#isRecording = true;
          } else {
            this.#mediaRecorder.stop(); //stopping recording
            this.stopTimer(); //stop and clear timer
            this.clearTimer();
            this.#chunks.length = []; //abnulls chunks
            this.audioPlayerEl.classList.remove("hidden"); //show audio - player
            this.#isRecording = false;
          }
          break;
        case "pause":
          this.togglePauseButton(); //changing pause button appearance
          if (this.#mediaRecorder.state == "recording") {
            this.#mediaRecorder.pause(); //pausing MediaRecorder
            this.stopTimer();
          } else {
            this.#mediaRecorder.resume(); //resuming recorder
            this.startTimer();
          }
          break;
      }
    });
  }

  get audioRecorder() {
    return this.#audioRecorderEl;
  }
  //creating audio element to listen records
  createAudioElement() {
    this.audioPlayerEl = document.createElement("div");
    this.audioPlayerEl.classList.add("audio-player");
    this.audioPlayerEl.classList.add("hidden");
    this.audioPlayerEl.innerHTML = `
    <h3>Audio Player</h3>
    <audio></audio>
    <div class="controls" data-source='player'>
      <div class="controls-btn">
        <button data-control="play"><i class="fa-solid fa-play"></i></button>
        <button data-control="pause"><i class="fa-solid fa-pause"></i></button>
        <button data-control="stop"><i class="fa-solid fa-stop"></i></button>
      </div>
    </div>`;

    this.audioPlayerEl.addEventListener("click", (e) => {
      const audioElem = this.audioPlayerEl.querySelector("audio");
      let target = e.target;
      let controlType = target.dataset.control;
      switch (controlType) {
        case "play":
          if (audioElem.currentTime >= audioElem.duration) {
            audioElem.currentTime = 0;
          }
          audioElem.play();
          break;
        case "pause":
          audioElem.pause();
          break;
        case "stop":
          audioElem.pause();
          audioElem.currentTime = 0;
          break;
        default:
          break;
      }
    });

    return this.audioPlayerEl;
  }

  togglePauseButton() {
    const pauseBtn = this.controlsRecEl.querySelector('[data-control="pause"] > i');
    pauseBtn.classList.toggle("fa-pause");
    pauseBtn.classList.toggle("fa-play");
  }

  toggleRecButton() {
    const recBtn = this.controlsRecEl.querySelector(".fa-circle");
    recBtn.classList.toggle("fa-solid");
    recBtn.classList.toggle("fa-regular");
  }

  toggleRecControlsButtons() {
    this.controlsRecEl.querySelector('[data-control="pause"]').classList.toggle("hidden");
  }

  startTimer() {
    this.#timer = setTimeout(() => {
      this.tickTimer();
      this.startTimer();
    }, 1000);
  }

  stopTimer() {
    clearInterval(this.#timer);
    this.#timer = null;
  }
  clearTimer() {
    this.timer_value = 0;
    this.#audioRecorderEl.querySelector(".timer").innerHTML = `
    <span>${this.getTimeString()}</span>
  `;
  }
  tickTimer() {
    this.timer_value += 1000;
    this.#audioRecorderEl.querySelector(".timer").innerHTML = `
      <span>${this.getTimeString(this.timer_value)}</span>
    `;
  }
  getTimeString() {
    let seconds = Math.floor((this.timer_value / 1000) % 60);
    let minutes = Math.floor(this.timer_value / 1000 / 60);
    let secondsStr = seconds < 10 ? `0${seconds}` : seconds;
    let minutesStr = minutes < 10 ? `0${minutes}` : minutes;
    return minutesStr + ":" + secondsStr;
  }
}
const container = document.querySelector(".container");
const recorder = new AudioRecorder();

container.appendChild(recorder.audioRecorder);
container.appendChild(recorder.createAudioElement());
