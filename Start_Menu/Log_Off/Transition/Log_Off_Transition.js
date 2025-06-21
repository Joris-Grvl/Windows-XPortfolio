(function () {
  function createTransitionScreen() {
    const transitionDiv = document.createElement("div");
    transitionDiv.id = "transition-screen";
    transitionDiv.style.position = "fixed";
    transitionDiv.style.inset = "0";
    transitionDiv.style.zIndex = "10001";
    transitionDiv.style.display = "flex";
    transitionDiv.style.alignItems = "center";
    transitionDiv.style.justifyContent = "center";
    transitionDiv.style.background = "black";
    document.body.appendChild(transitionDiv);
  }

  if (document.body) {
    createTransitionScreen();
  } else {
    new MutationObserver((mutations, observer) => {
      if (document.body) {
        observer.disconnect();
        createTransitionScreen();
      }
    }).observe(document.documentElement, { childList: true, subtree: true });
  }
  window.addEventListener("DOMContentLoaded", function () {
    const transitionDiv = document.getElementById("transition-screen");

    fetch("/Start_Menu/Log_Off/Transition/Log_Off_Transition.html")
      .then((response) => response.text())
      .then((html) => {
        transitionDiv.innerHTML = html;

        const shutdownSound = new Audio(
          "/Assets/Sounds/windows-xp-shutdown.mp3"
        );
        shutdownSound
          .play()
          .catch((error) => console.error("Audio error:", error));

        setTimeout(() => {
          const logOffP = document.querySelector("#Transi_log_off p");
          if (logOffP) {
            logOffP.textContent = "Saving your settings...";
            logOffP.style.paddingLeft = "0";
          }
        }, 1500);

        setTimeout(() => {
          transitionDiv.remove();
          const loginScreen = document.getElementById("login-screen");
          if (loginScreen) loginScreen.classList.remove("hidden");
        }, 1700);
      });
  });
})();
