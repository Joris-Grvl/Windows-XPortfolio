window.addEventListener("load", function () {
  setTimeout(() => {
    let loader = document.getElementById("loader");
    let loginScreen = document.getElementById("login-screen");

    if (loader && loginScreen) {
      loader.style.display = "none";

      const blackScreen = document.createElement("div");
      blackScreen.style.position = "fixed";
      blackScreen.style.inset = "0";
      blackScreen.style.background = "black";
      blackScreen.style.zIndex = "10000";
      blackScreen.style.opacity = "1";
      blackScreen.style.transition = "";
      document.body.appendChild(blackScreen);

      setTimeout(() => {
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

        blackScreen.remove();

        fetch("/Loader_Login/Startup_Transition.html")
          .then((response) => response.text())
          .then((html) => {
            transitionDiv.innerHTML = html;
            setTimeout(() => {
              transitionDiv.remove();
              loginScreen.classList.remove("hidden");
            }, 800);
          });
      }, 1000);
    } else {
      console.error("Missing #loader or #login-screen");
    }
  }, 4000);
});

window.addEventListener("DOMContentLoaded", function () {
  document.body.classList.add("fade-in-steps");
});

function switchUserLogOn() {
  localStorage.setItem("fromSwitchUser", "1");
  window.location.href = "/Bureau/Bureau.html";
}

let hasLoggedInAsGuest = false;

function loginAsGuest() {
  if (hasLoggedInAsGuest) return;
  hasLoggedInAsGuest = true;

  const leftSection = document.getElementById("left-section");
  const rightText = document.getElementById("right-text");
  const adminUser = document.getElementById("admin-user");
  const leftPanel = document.getElementById("left-panel");
  const userList = document.getElementById("user-list");
  const guestUser = document.getElementById("guest-user");
  const guestSpan = guestUser.querySelector("span");

  leftPanel.innerHTML = `<p>welcome</p>`;
  leftPanel.style.paddingTop = "18%";

  const leftPanelP = leftPanel.querySelector("p");
  Object.assign(leftPanelP.style, {
    fontSize: "5rem",
    fontFamily: "Arial, sans-serif",
    fontStyle: "italic",
    fontWeight: "bold",
    textShadow: "2px 3px #3454b4",
  });

  guestSpan.insertAdjacentHTML(
    "afterend",
    `<p>Loading your personal settings...</p>`
  );

  userList.classList.add("is-padding-anim");
  userList.style.animation = "paddingTopLog 1s forwards";
  setTimeout(() => {
    userList.classList.remove("is-padding-anim");
  }, 1000);

  leftSection.style.display = "none";
  rightText.style.display = "none";
  adminUser.style.display = "none";

  setTimeout(() => {
    window.location.href = "/Bureau/Bureau.html";
  }, 1000);

  guestUser.classList.remove("selected");
}

document.addEventListener("DOMContentLoaded", function () {
  const userList = document.getElementById("user-list");
  const users = document.querySelectorAll(".user");
  let selectedIndex = null;
  let hasArrowBeenUsed = false;

  function updateUserSelection(index) {
    users.forEach((u, i) => u.classList.toggle("selected", i === index));
  }

  updateUserSelection(selectedIndex);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && guestUser.classList.contains("selected")) {
      if (
        window.location.pathname.endsWith(
          "/Start_Menu/Log_Off/Transition/Switch_User.html"
        )
      ) {
        switchUserLogOn();
      } else {
        loginAsGuest();
      }
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!hasArrowBeenUsed) {
        selectedIndex = 0;
        updateUserSelection(selectedIndex);
        hasArrowBeenUsed = true;
        users.forEach((user, i) => {
          if (i === selectedIndex) {
            user.style.opacity = "1";
            user.style.animation = "";
          } else {
            user.style.opacity = "0.5";
            user.style.animation = "glitchOpacityReverse 0.4s steps(5, end)";
          }
        });
        e.preventDefault();
        return;
      }
    }

    if (hasArrowBeenUsed) {
      if (e.key === "ArrowDown") {
        if (selectedIndex < users.length - 1) {
          selectedIndex++;
          updateUserSelection(selectedIndex);

          users.forEach((user, i) => {
            if (i === selectedIndex) {
              user.style.opacity = "1";
              user.style.animation = "";
              handleAdminSelection();
            } else {
              user.style.opacity = "0.5";
              user.style.animation = "glitchOpacityReverse 0.4s steps(5, end)";
            }
          });
        }
        e.preventDefault();
      } else if (e.key === "ArrowUp") {
        if (selectedIndex > 0) {
          selectedIndex--;
          updateUserSelection(selectedIndex);

          users.forEach((user, i) => {
            if (i === selectedIndex) {
              user.style.opacity = "1";
              user.style.animation = "";
            } else {
              user.style.opacity = "0.5";
              user.style.animation = "glitchOpacityReverse 0.4s steps(5, end)";
            }
          });
        }
        e.preventDefault();
      }
    }
  });

  if (!userList || users.length === 0) {
    console.error("Élément '#user-list' ou '.user' manquant !");
    return;
  }

  userList.addEventListener("mouseenter", function () {
    const hasSelected = Array.from(users).some((user) =>
      user.classList.contains("selected")
    );
    if (hasSelected) return;

    users.forEach((user) => {
      user.style.opacity = "0.5";
      user.style.animation = "glitchOpacityReverse 0.4s steps(5, end)";
    });
  });

  userList.addEventListener("mouseleave", function () {
    const hasSelected = Array.from(users).some((user) =>
      user.classList.contains("selected")
    );
    if (hasSelected) return;

    users.forEach((user) => {
      user.style.opacity = "1";
      user.style.animation = "glitchOpacity 0.4s steps(5, end)";
    });
  });

  users.forEach((user) => {
    user.addEventListener("mouseenter", function () {
      if (user.classList.contains("selected")) {
        this.style.opacity = "1";
        this.style.animation = "";
      } else {
        this.style.opacity = "1";
        this.style.animation = "";
      }
    });
    user.addEventListener("mouseleave", function () {
      if (user.classList.contains("selected")) {
        this.style.opacity = "1";
        this.style.animation = "";
      } else {
        if (
          userList.matches(":hover") &&
          !userList.classList.contains("is-padding-anim")
        ) {
          this.style.opacity = "0.5";
          this.style.animation = "glitchOpacityReverse 0.4s steps(5, end)";
        }
      }
    });
  });

  users.forEach((user) => {
    const userimg = user.querySelector("img");
    if (userimg) {
      user.addEventListener("mouseenter", function () {
        userimg.style.border = "2px solid #bfa304";
      });
      user.addEventListener("mouseleave", function () {
        userimg.style.border = "2px solid white";
      });
    }
  });

  const guestUser = document.getElementById("guest-user");
  if (guestUser) {
    guestUser.addEventListener("mousedown", function () {
      const guestP = guestUser.querySelector("p");
      if (guestP) {
        guestP.style.color = "white";
      }
    });
  }

  const adminUser = document.getElementById("admin-user");

  function removePasswordForm() {
    const existingForm = adminUser.querySelector(".login-screen__password");
    if (existingForm) {
      existingForm.remove();
    }
  }

  users.forEach((user) => {
    if (user !== adminUser) {
      user.addEventListener("mousedown", function () {
        users.forEach((u) => u.classList.remove("selected"));
        this.classList.add("selected");
      });

      user.addEventListener("mouseup", function () {
        users.forEach((u) => u.classList.remove("selected"));
        this.style.opacity = "1";
      });
      document.addEventListener("click", () => {
        user.classList.remove("selected");
        hasArrowBeenUsed = false;
        user.style.opacity = "1";
      });
    }
  });

  if (adminUser) {
    adminUser.setAttribute("tabindex", "0");

    adminUser.addEventListener("mousedown", () => {
      handleAdminSelection();
    });

    function handleAdminSelection() {
      document
        .querySelectorAll(".user.selected")
        .forEach((u) => u.classList.remove("selected"));

      adminUser.classList.add("selected");

      const userTextDiv = adminUser.querySelector(".user-text");

      if (
        userTextDiv &&
        !userTextDiv.querySelector(".login-screen__password")
      ) {
        userTextDiv.insertAdjacentHTML(
          "beforeend",
          `
        <div class="login-screen__password">
          <p>Type your password</p>
          <form onsubmit="event.preventDefault(); return false;">
            <input id="Password" type="password">
            <button class="login-screen__submit" type="submit">
              <img id="Go" src="/Assets/Windows XP High Resolution Icon Pack avec MAOSX/Windows XP High Resolution Icon Pack/Windows XP Icons/Go.png" alt="Validate Login">
            </button>
            <button class="login-screen__question" type="button">
              <img id="Login_Question" src="/Assets/Windows XP High Resolution Icon Pack avec MAOSX/Windows XP High Resolution Icon Pack/Windows XP Icons/Login Question.png" alt="Validate Login">
            </button>
          </form>
        </div>
      `
        );

        setTimeout(() => {
          const passwordInput = adminUser.querySelector("#Password");
          if (passwordInput) passwordInput.focus();
        }, 0);
      }
    }

    document.addEventListener("click", (e) => {
      if (!adminUser.contains(e.target)) {
        adminUser.classList.remove("selected");
        removePasswordForm();
        hasArrowBeenUsed = false;
      }
    });

    const observer = new MutationObserver(() => {
      if (!adminUser.classList.contains("selected")) {
        removePasswordForm();
      }
    });

    observer.observe(adminUser, {
      attributes: true,
      attributeFilter: ["class"],
    });

    function removePasswordForm() {
      const existingForm = adminUser.querySelector(".login-screen__password");
      if (existingForm) {
        existingForm.remove();
      }
    }
  }
});
