const $ = require('jquery');
const moment = require('moment');

String.prototype.toHHMMSS = function () {
  var sec_num = parseInt(this, 10); // don't forget the second param
  var hours = Math.floor(sec_num / 3600);
  var minutes = Math.floor((sec_num - hours * 3600) / 60);
  var seconds = sec_num - hours * 3600 - minutes * 60;

  if (hours < 10) {
    hours = "0" + hours;
  }
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  return hours + ":" + minutes + ":" + seconds;
};

function toggle(state) {
  if (state) {
    $("#play").addClass("hidden")
    $("#pause").removeClass('hidden')
  } else {
    $("#play").removeClass("hidden")
    $("#pause").addClass('hidden')
  }
}

const convert = (n) => String(n).toHHMMSS()

const playAudio = async () => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const audioDevices = devices.filter(
    (device) => device.kind === "audiooutput"
  );

const volume = Number.parseInt($("#volume").val());

const audio = new Audio('timer.wav');
audio.volume = volume / 100;

audio.play();

await audio.setSinkId(
  audioDevices.filter((i) => i.label == "Speakers (Realtek(R) Audio)")[0]
    .deviceId
);
}

$(() => {
  const timer = $("#timer");
  const volume = $("#volume");

  volume.val(window.localStorage.getItem("volume") ?? 50);
  $("#display").text("Volume: " + volume.val() + "%" );

  const startingTime = localStorage.getItem("startingTime") ?? 300;
  var time = -50;
  
  const pause = $("#toggle")

  var state = JSON.parse(window.localStorage.getItem("paused")) ?? false

  console.log(state)

  toggle(JSON.parse(state))

  pause.on('click', () => {
      window.localStorage.setItem("paused", !JSON.parse(state))

      console.log()

      console.log(localStorage)

      state = !JSON.parse(state)

      toggle(state)
  })


  const intervalF = () => {
    if (!state) return;


    time--;

    if (time == -1) {
      timer.text("");

      showButton(true);

      playAudio();

      const NOTIFICATION_TITLE = "Your Timer is Done!";
      const NOTIFICATION_BODY =
        "Your timer is finished. Make sure to continue it once you are done.";
      const CLICK_MESSAGE = "Notification clicked";

      new Notification(NOTIFICATION_TITLE, { body: NOTIFICATION_BODY });
    }

    if (time >= 0) timer.text(convert(time));
  };

  var interval = setInterval(intervalF, 1000);


  const showButton = (s = true) => {
    const button = $("<button>");
    button.text(s ? "Press to Restart Timer" : "Press to Start Timer");
    button.on("click", () => {
      startingTime = localStorage.getItem("startingTime") ?? 300
      time = startingTime;
      $("#timer").text(convert(time));
      interval = setInterval(intervalF, 1000);

    });

    clearInterval(interval);

    $("#timer").append(button);
  };

  showButton(false);
  
})
