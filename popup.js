document.addEventListener("DOMContentLoaded", () => {

  const ids = ["water","focus","posture","interval"];

  const timerDisplay = document.getElementById("timer");
  const startBtn = document.getElementById("start");
  const resetBtn = document.getElementById("reset");

  const focusInput = document.getElementById("focusTime");
  const breakInput = document.getElementById("breakTime");

  const darkToggle = document.getElementById("darkMode");

  let timer = null;
  let time = 25 * 60;
  let isBreak = false;

  // LOAD SETTINGS
  chrome.storage.sync.get(null,(settings)=>{

    ids.forEach(id=>{
      if(settings[id] !== undefined){
        const el = document.getElementById(id);
        if(el) el.value = settings[id];
      }
    });

    focusInput.value = settings.focusTime || 25;
    breakInput.value = settings.breakTime || 5;

    if(settings.darkMode){
      document.body.classList.add("dark");
      darkToggle.checked = true;
    }

  });

  // SAVE SETTINGS
  document.getElementById("save").addEventListener("click",()=>{

    const newSettings = {};

    ids.forEach(id=>{
      const value = document.getElementById(id).value;
      newSettings[id] = id === "interval" ? parseInt(value,10) : value;
    });

    newSettings.focusTime = parseInt(focusInput.value);
    newSettings.breakTime = parseInt(breakInput.value);

    chrome.storage.sync.set(newSettings,()=>{

      chrome.runtime.sendMessage({
        type:"rescheduleAlarms",
        interval:newSettings.interval
      });

      alert("Settings saved!");
    });

  });

 

  // TIMER DISPLAY
  function updateDisplay(){

    const minutes = Math.floor(time/60);
    const seconds = time % 60;

    timerDisplay.textContent =
      `${minutes}:${seconds.toString().padStart(2,"0")}`;

  }

  // START POMODORO
  startBtn.addEventListener("click",()=>{

    if(timer) return;

    const focusTime = parseInt(focusInput.value);
    const breakTime = parseInt(breakInput.value);

    time = focusTime * 60;

    timer = setInterval(()=>{

      time--;
      updateDisplay();

      if(time <= 0){

        if(!isBreak){

          chrome.notifications.create({
            type:"basic",
            iconUrl:"icon.png",
            title:"Focus Session Complete",
            message:"Take a break!"
          });

          time = breakTime * 60;
          isBreak = true;

        }else{

          chrome.notifications.create({
            type:"basic",
            iconUrl:"icon.png",
            title:"Break Over",
            message:"Back to work!"
          });

          chrome.storage.local.get(["sessions"],(data)=>{
            const sessions = (data.sessions || 0) + 1;
            chrome.storage.local.set({sessions});
            updateSessions();
          });

          time = focusTime * 60;
          isBreak = false;

        }

      }

    },1000);

  });

  // RESET TIMER
  resetBtn.addEventListener("click",()=>{

    clearInterval(timer);
    timer = null;

    time = parseInt(focusInput.value) * 60;
    isBreak = false;

    updateDisplay();

  });

  // SESSION COUNTER
  function updateSessions(){

    chrome.storage.local.get(["sessions"],(data)=>{

      const count = data.sessions || 0;

      const el = document.getElementById("sessions");

      if(el){
        el.textContent = "Sessions completed: " + count;
      }

    });

  }

  updateDisplay();
  updateSessions();

});
