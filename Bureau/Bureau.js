let startMenuHTML = "";
let openWindowHTML = "";
let openLogOffHTML = "";
let turnOffComputerHTML = "";

let zIndexCounter = 1;
const savedZ = localStorage.getItem("zIndexCounter");
if (savedZ !== null) {
  zIndexCounter = parseInt(savedZ, 10);
}

let isResizingGlobal = false;

let currentTooltipContainer = null;
let currentLabel = null;

let recentlyClosedStartMenu = false;

let hoverTooltipMouseEnterHandler = null;
let hoverTooltipMouseLeaveHandler = null;

async function loadHTML(filePath) {
  const res = await fetch(filePath);
  if (!res.ok) throw new Error(`Loading error : ${filePath}`);
  return await res.text();
}

loadHTML("/Start_Menu/Base/Start_Menu.html").then(
  (html) => (startMenuHTML = html)
);
loadHTML("/Open_Windows/Base/Open_Window.html").then(
  (html) => (openWindowHTML = html)
);
loadHTML("/Start_Menu/Log_Off/Base/Log_Off.html").then(
  (html) => (openLogOffHTML = html)
);
loadHTML("/Start_Menu/Turn_Off_Computer/Turn_Off_Computer.html").then(
  (html) => (turnOffComputerHTML = html)
);

function playSoundOnPage(path, defaultSoundPath, onLoadCallback) {
  if (window.location.pathname.endsWith(path)) {
    window.addEventListener("load", function () {
      let soundPath = defaultSoundPath;

      if (
        path === "/Bureau/Bureau.html" &&
        localStorage.getItem("fromSwitchUser") === "1"
      ) {
        soundPath = "/Assets/Sounds/Resume_Users.mp3";
        localStorage.removeItem("fromSwitchUser");
      }

      const guestUser = document.getElementById("guest-user");
      if (guestUser && guestUser.querySelector("#loaded")) {
        soundPath = "/Assets/Sounds/Resume_Users.mp3";
      }

      const audio = new Audio(soundPath);
      audio.play().catch((error) => console.error("Audio error:", error));
      if (typeof onLoadCallback === "function") {
        onLoadCallback();
      }
    });
  }
}

playSoundOnPage(
  "/Bureau/Bureau.html",
  "/Assets/Sounds/windows-xp-startup.mp3",
  function () {
    openWindow("LinkedIn");
    toggleWindow("LinkedIn");
    toggleWindow("LinkedIn");
  }
);

playSoundOnPage(
  "/Start_Menu/Log_Off/Transition/Switch_User.html",
  "/Assets/Sounds/Switch_Users.mp3"
);

document.addEventListener("DOMContentLoaded", () => {
  updateTaskbarVisibility();

  function updateClock() {
    let now = new Date().toLocaleTimeString([], {
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
    });
    document.getElementById("footer-time").textContent = now;
  }

  updateClock();
  setInterval(updateClock, 52000);

  const startBtn = document.getElementById("start-button");
  startBtn.addEventListener("mouseenter", () => {
    startBtn.src = "/Assets/Images/windows_xp_start_button_hover.png";
  });

  startBtn.addEventListener("mouseleave", () => {
    startBtn.src = "/Assets/Images/windows_xp_start_button_normal.png";
  });

  startBtn.addEventListener("mousedown", () => {
    startBtn.src = "/Assets/Images/windows_xp_start_button_onclick.png";
  });

  startBtn.addEventListener("mouseup", () => {
    const isHovering = startBtn.matches(":hover");
    startBtn.src = isHovering
      ? "/Assets/Images/windows_xp_start_button_hover.png"
      : "/Assets/Images/windows_xp_start_button_normal.png";
  });
});

document.addEventListener("click", function (event) {
  const menu = document.getElementById("StartMenu");
  const startMenuBtn = document.querySelector(".footer__start_menu");

  if (
    menu &&
    !menu.contains(event.target) &&
    !startMenuBtn.contains(event.target)
  ) {
    menu.remove();
  }
});

function openWindow(appName) {
  let windowTooltipContainer = null;
  let windowCurrentLabel = null;

  createTaskbar();
  injectStyle("bureau-styles", "/Open_Windows/Base/Open_Window.css");
  injectStyle("taskbar-styles", "/Bureau/Taskbar.css");
  injectStyle(`window-${appName}`, `/Open_Windows/${appName}/${appName}.css`);

  let taskbar = document.getElementById("taskbar");

  if (document.getElementById(`window-${appName}`)) return;

  let windowElement = document.createElement("div");
  windowElement.id = `window-${appName}`;
  windowElement.classList.add("window");

  const personalizedHTML = openWindowHTML.replace(/\$\{appName\}/g, appName);
  windowElement.innerHTML = personalizedHTML;

  if (appName === "Minesweeper") {
    const maximazeButton = windowElement.querySelector(
      ".header-button--maximaze"
    );
    if (maximazeButton) {
      maximazeButton.removeAttribute("onclick");
      maximazeButton.disabled = true;
      maximazeButton.style.opacity = "0.5";
      maximazeButton.style.pointerEvents = "none";
      windowElement.style.width = "auto";
      windowElement.style.height = "auto";
    }
  } else {
    makeResizable(windowElement);
    const header = windowElement.querySelector(".window-header");
    if (header) {
      header.setAttribute("ondblclick", `maximazeWindow('${appName}')`);
    }
  }

  if (appName === "Space Cadet Pinball") {
    // Cache la fenêtre au départ
    windowElement.style.visibility = "hidden";
    windowElement.style.opacity = "0";
  }

  fetch(`/Open_Windows/${appName}/${appName}.html`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Fichier introuvable");
      }
      return response.text();
    })
    .then((htmlContent) => {
      const contentContainer = windowElement.querySelector(".window-content");
      if (contentContainer) {
        contentContainer.innerHTML = htmlContent;
      } else {
        windowElement.innerHTML = htmlContent;
      }

      const labelDivs = windowElement.querySelectorAll(
        ".drop_down_label, .Minesweeper_drop_down_label"
      );

      labelDivs.forEach((labelDiv) => {
        labelDiv.addEventListener("click", function () {
          if (windowTooltipContainer && windowTooltipContainer.parentNode) {
            windowTooltipContainer.removeAttribute("data-tooltip-initialized");
            windowTooltipContainer.parentNode.removeChild(
              windowTooltipContainer
            );
            windowTooltipContainer = null;
          }
          windowCurrentLabel = labelDiv;

          const fileName = labelDiv.textContent.trim();
          fetch(`/Open_Windows/${appName}/Tooltip/${fileName}.html`)
            .then((response) => response.text())
            .then((htmlContent) => {
              const container = document.createElement("div");
              container.className = "window-tooltip";
              container.innerHTML = htmlContent;
              observeMinesweeperTooltipLoad();
              observeSecondaryTooltipRows(appName);
              labelDiv.parentNode.insertBefore(container, labelDiv.nextSibling);
              windowTooltipContainer = container;

              const closeDivs = container.querySelectorAll(".drop-down__text");
              closeDivs.forEach((div) => {
                const txt = div.textContent.trim().toLowerCase();
                if (txt === "close" || txt === "exit") {
                  div.setAttribute("onclick", `closeWindow('${appName}')`);
                }
              });
            })
            .catch((err) => {
              console.error("Erreur de chargement du fichier HTML:", err);
            });
        });

        labelDiv.addEventListener("mouseenter", function () {
          if (!windowTooltipContainer) return;
          if (windowCurrentLabel === labelDiv) return;

          if (windowTooltipContainer && windowTooltipContainer.parentNode) {
            windowTooltipContainer.removeAttribute("data-tooltip-initialized");
            windowTooltipContainer.parentNode.removeChild(
              windowTooltipContainer
            );
            windowTooltipContainer = null;
          }
          windowCurrentLabel = labelDiv;

          const fileName = labelDiv.textContent.trim();
          fetch(`/Open_Windows/${appName}/Tooltip/${fileName}.html`)
            .then((response) => response.text())
            .then((htmlContent) => {
              const container = document.createElement("div");
              container.className = "window-tooltip";
              container.innerHTML = htmlContent;
              observeMinesweeperTooltipLoad();
              observeSecondaryTooltipRows(appName);
              labelDiv.parentNode.insertBefore(container, labelDiv.nextSibling);
              windowTooltipContainer = container;

              const closeDivs = container.querySelectorAll(".drop-down__text");
              closeDivs.forEach((div) => {
                const txt = div.textContent.trim().toLowerCase();
                if (txt === "close" || txt === "exit") {
                  div.setAttribute("onclick", `closeWindow('${appName}')`);
                }
              });
            })
            .catch((err) => {
              console.error("Erreur de chargement du fichier HTML:", err);
            });
        });
      });

      windowElement.addEventListener("mousedown", function (event) {
        const isOnLabel = Array.from(labelDivs).some((label) =>
          label.contains(event.target)
        );
        const isOnTooltip =
          windowTooltipContainer &&
          windowTooltipContainer.contains(event.target);

        if (!isOnLabel && !isOnTooltip && windowTooltipContainer) {
          if (windowTooltipContainer && windowTooltipContainer.parentNode) {
            windowTooltipContainer.removeAttribute("data-tooltip-initialized");
            windowTooltipContainer.parentNode.removeChild(
              windowTooltipContainer
            );
            windowTooltipContainer = null;
            windowCurrentLabel = null;
          }
        }
      });
    })
    .catch((error) => {
      console.error("Erreur de chargement :", error);
    });

  document.body.appendChild(windowElement);
  windowElement.style.top = "115px";
  windowElement.style.left = "115px";
  makeDraggable(windowElement);

  if (!document.getElementById(`taskbar-${appName}`)) {
    let taskbarItem = document.createElement("div");
    taskbarItem.id = `taskbar-${appName}`;
    taskbarItem.classList.add("taskbar-item");
    taskbarItem.innerHTML = `<img src="/Assets/Windows XP High Resolution Icon Pack avec MAOSX/Windows XP High Resolution Icon Pack/Windows XP Icons/${appName}.png" width="16"> <span>${appName}</span>`;
    taskbarItem.onmousedown = () => toggleWindow(appName);
    taskbar.appendChild(taskbarItem);
  }

  window.addEventListener("mousedown", function (event) {
    const windowEl = windowElement;
    if (!windowEl) return;

    const isInWindow = windowEl.contains(event.target);
    const isInTooltip =
      windowTooltipContainer && windowTooltipContainer.contains(event.target);

    if (!isInWindow && !isInTooltip && windowTooltipContainer) {
      windowTooltipContainer.removeAttribute("data-tooltip-initialized");
      windowTooltipContainer.remove();
      windowTooltipContainer = null;
      windowCurrentLabel = null;
    }
  });
}

function observeSecondaryTooltipRows(appName) {
  const windowElement = document.getElementById(`window-${appName}`);
  if (!windowElement) return;
  const observer = new MutationObserver(() => {
    const tooltipWindows = Array.from(
      windowElement.querySelectorAll(
        ".window-tooltip:not([data-tooltip-initialized])"
      )
    ).filter((el) => el.offsetParent !== null);

    if (tooltipWindows.length > 0) {
    } else {
    }

    tooltipWindows.forEach((tooltipWindow) => {
      tooltipWindow.setAttribute("data-tooltip-initialized", "true");

      const dropDownRows = tooltipWindow.querySelectorAll(".drop-down__row");
      let windowSecondTooltip = null;
      let windowSecondCurrentRow = null;

      dropDownRows.forEach((row) => {
        row.addEventListener("mouseenter", function () {
          const textDiv = row.querySelector(".drop-down__text");
          if (!textDiv) return;

          const fileName = textDiv.textContent.trim();
          if (windowSecondCurrentRow === row) return;

          if (windowSecondTooltip?.parentNode) {
            windowSecondTooltip.parentNode.removeChild(windowSecondTooltip);
            windowSecondTooltip = null;
          }

          windowSecondCurrentRow = row;

          const allowedTooltips = [
            "Encoding",
            "Explorer Bar",
            "Go to",
            "Mail and News",
            "New",
            "Send",
            "Text Size",
            "Toolbars",
            "Arrange Icons by",
            "Links",
            "Pop-up Blocker",
          ];

          if (!allowedTooltips.includes(fileName)) return;

          if (allowedTooltips.includes(fileName)) {
            fetch(`/Open_Windows/${appName}/Sub_Tooltip/${fileName}.html`)
              .then((response) => {
                if (!response.ok) {
                  if (response.status === 404) return null;
                  throw new Error(`Erreur HTTP: ${response.status}`);
                }
                return response.text();
              })
              .then((htmlContent) => {
                const container = document.createElement("div");
                container.className = "window-Sub_tooltip";
                container.innerHTML = htmlContent;

                const tooltipWindow = row.closest(".window-tooltip");
                if (!tooltipWindow) return;

                const reference = row.querySelector(".drop-down__text");
                const rect = reference.getBoundingClientRect();

                const referenceRect = reference.getBoundingClientRect();
                const parentRect = tooltipWindow.getBoundingClientRect();

                const offsetX = referenceRect.left - parentRect.left;
                const offsetY = referenceRect.bottom - parentRect.top + 5;

                container.style.position = "absolute";
                container.style.left = `${offsetX + 110}px`;
                container.style.top = `${offsetY - 5}px`;

                tooltipWindow.appendChild(container);
                windowSecondTooltip = container;
              })
              .catch(() => {});
          }
        });
      });
    });
  });

  observer.observe(windowElement, {
    childList: true,
    subtree: true,
  });
}

function updateCheckmarkInTooltip() {
  const selectedLevel = localStorage.getItem("SelectedLevel");
  if (!selectedLevel) return;

  const minesweeperMenu = document.querySelector(".Minesweeper_drop_down");
  if (!minesweeperMenu) return;

  const rows = minesweeperMenu.querySelectorAll(".drop-down__row");

  rows.forEach((row) => {
    const checkContainer = row.querySelector(".drop-down__check");
    const textContainer = row.querySelector(".drop-down__text");

    if (!checkContainer || !textContainer) return;

    checkContainer.innerHTML = "";

    const levelText = textContainer.textContent.trim().toLowerCase();
    const selectedText = selectedLevel.trim().toLowerCase();

    if (levelText === selectedText) {
      const img = document.createElement("img");
      img.src = "/Assets/Images/Tooltip_CheckMark.png";
      img.alt = "Check Mark";
      checkContainer.appendChild(img);
    }
  });
}

function observeMinesweeperTooltipLoad() {
  const observer = new MutationObserver(() => {
    const tooltip = document.querySelector(".Minesweeper_drop_down");
    if (tooltip) {
      updateCheckmarkInTooltip();
      observer.disconnect();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function openRawWinamp() {
  if (document.getElementById("app") || document.getElementById("webamp")) {
    return;
  }
  const winampDiv = document.createElement("div");
  winampDiv.id = "app";
  winampDiv.style.position = "absolute";
  winampDiv.style.left = "0";
  winampDiv.style.top = "0";
  document.body.appendChild(winampDiv);

  const script = document.createElement("script");
  script.src = "https://unpkg.com/webamp@latest/built/webamp.bundle.min.js";
  script.onload = () => {
    if (typeof Webamp === "undefined") {
      console.error("Webamp is not loaded!");
      return;
    }
    const webamp = new Webamp({
      initialTracks: [
        {
          metaData: {
            artist: "Michael Jackson",
            title: "Billie Jean",
          },
          url: "/Assets/Sounds/Michael Jackson - Billie Jean (Official Video).mp3",
        },
        {
          metaData: {
            artist: "Joe Hisaishi, Royal Philharmonic Orchestra",
            title: "The Bygone Days",
          },
          url: "/Assets/Sounds/The Bygone Days   Porco Rosso.mp3",
        },
        {
          metaData: {
            artist: "Playboi Carti & The Weeknd",
            title: "RATHER LIE (Official Audio)",
          },
          url: "/Assets/Sounds/Playboi Carti & The Weeknd - RATHER LIE (Official Audio).mp3",
        },
        {
          metaData: {
            artist: "Kal Banx ft Smino x Buddy",
            title: "HOP OUT CHO FEELINGS",
          },
          url: "/Assets/Sounds/Kal Banx ft Smino x Buddy  - HOP OUT CHO FEELINGS (Official Video).mp3",
        },
      ],
    });
    webamp.renderWhenReady(winampDiv).then(() => {
      const observer = new MutationObserver(() => {
        const webampDiv = document.getElementById("webamp");
        if (webampDiv) {
          observer.disconnect();

          const classObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              if (mutation.attributeName === "class") {
                if (webampDiv.classList.contains("window-inactive")) {
                  webampDiv.classList.remove("window-inactive");
                }
                const inactiveChildren =
                  webampDiv.querySelectorAll(".window-inactive");
                inactiveChildren.forEach((el) => {
                  el.classList.remove("window-inactive");
                  el.style.setProperty("background-color", "none", "important");
                });
                webampDiv.style.setProperty(
                  "background-color",
                  "",
                  "important"
                );
              }
            });
          });

          classObserver.observe(webampDiv, { attributes: true, subtree: true });

          zIndexCounter++;
          webampDiv.style.zIndex = zIndexCounter.toString();
          webampDiv.classList.add("window", "no-bg");

          updateTaskbarHighlight();

          const windowEl = document.querySelector("#webamp .window");

          const styleObserver = new MutationObserver(() => {
            windowEl.style.setProperty("width", "0", "important");
            windowEl.style.setProperty("height", "0", "important");
          });

          styleObserver.observe(windowEl, {
            attributes: true,
            attributeFilter: ["style"],
          });

          webampDiv.addEventListener("mousedown", () => {
            zIndexCounter++;
            webampDiv.style.zIndex = zIndexCounter.toString();
            updateTaskbarHighlight();
          });
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
    });

    webamp.onClose(() => {
      if (taskbarItem) taskbarItem.remove();
      if (winampDiv.parentNode) winampDiv.parentNode.removeChild(winampDiv);
      if (script.parentNode) script.parentNode.removeChild(script);
      const webampContainer = document.getElementById("webamp");
      if (webampContainer && webampContainer.parentNode) {
        webampContainer.parentNode.removeChild(webampContainer);
      }
    });

    setTimeout(() => {
      const closeBtn = document.getElementById("close");
      if (closeBtn) {
        closeBtn.addEventListener("click", () => {
          if (winampDiv.parentNode) winampDiv.parentNode.removeChild(winampDiv);
          if (script.parentNode) script.parentNode.removeChild(script);
          const webampContainer = document.getElementById("webamp");
          if (webampContainer && webampContainer.parentNode) {
            webampContainer.parentNode.removeChild(webampContainer);
            updateTaskbarHighlight();
          }
        });
      }
    }, 1150);
  };

  setTimeout(() => {
    const minimizeBtn = document.querySelector("#webamp #minimize");
    if (minimizeBtn) {
      minimizeBtn.addEventListener("click", () => {
        const win = document.getElementById("webamp");
        if (win) win.style.display = "none";
        updateTaskbarHighlight();
      });
    }
  }, 1000);

  winampDiv.appendChild(script);

  let taskbarItem = document.getElementById("taskbar-Winamp");

  if (!document.getElementById(`taskbar-Winamp`)) {
    taskbarItem = document.createElement("div");
    taskbarItem.id = `taskbar-Winamp`;
    taskbarItem.classList.add("taskbar-item");
    taskbarItem.innerHTML = `<img src="/Assets/Images/Winamp-logo.png" width="16"> <span>Winamp</span>`;
    taskbarItem.onmousedown = () => {
      const winampWindow = document.getElementById("webamp");
      if (!winampWindow) return;

      const winampZ = parseInt(winampWindow.style.zIndex || "0", 10);

      if (
        winampWindow.style.display === "none" ||
        getComputedStyle(winampWindow).display === "none"
      ) {
        winampWindow.style.display = "block";
        zIndexCounter++;
        winampWindow.style.zIndex = zIndexCounter;
        updateTaskbarHighlight();
      } else if (winampZ < zIndexCounter) {
        zIndexCounter++;
        winampWindow.style.zIndex = zIndexCounter;
        updateTaskbarHighlight();
      } else if (winampZ >= zIndexCounter) {
        winampWindow.style.display = "none";
        updateTaskbarHighlight();
      }
    };
    taskbar.appendChild(taskbarItem);
  }
}

function waitForGameToLoad() {
  console.log("waitForGameToLoad started");

  const iframe = document.getElementById("pinball-frame");
  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

  const observer = new MutationObserver(() => {
    checkGameReady();
  });

  const styleObserver = new MutationObserver(() => {
    checkGameReady();
  });

  function checkGameReady() {
    try {
      const canvas = iframeDoc.querySelector("canvas.emscripten#canvas");
      const statusElement = iframeDoc.querySelector("#status");

      console.log(
        `Canvas found: ${!!canvas}, Status element found: ${!!statusElement}`
      );

      if (canvas) {
        console.log(
          `Canvas display: ${canvas.style.display}, Width: ${canvas.width}, Height: ${canvas.height}`
        );
      }

      const isGameLoaded =
        statusElement &&
        (statusElement.innerHTML === "" ||
          statusElement.style.display === "none") &&
        canvas &&
        canvas.style.display !== "none" &&
        (canvas.width > 0 || canvas.clientWidth > 0);

      console.log(`Game loaded: ${isGameLoaded}`);

      if (isGameLoaded) {
        // Arrête les observers
        observer.disconnect();
        styleObserver.disconnect();

        const finalWidth = canvas.width || canvas.clientWidth || 600;
        const finalHeight = canvas.height || canvas.clientHeight || 440;

        console.log(`Final canvas dimensions: ${finalWidth}x${finalHeight}`);

        // Redimensionne la fenêtre
        applyCanvasDimensionsToWindow(finalWidth, finalHeight);
        resizeWindow(finalWidth, finalHeight);

        // Affiche la fenêtre après redimensionnement
        setTimeout(() => {
          showWindow();
          hideLoading();
        }, 100);

        return;
      }

      if (canvas && !canvas.dataset.observed) {
        canvas.dataset.observed = "true";
        styleObserver.observe(canvas, {
          attributes: true,
          attributeFilter: ["style", "width", "height"],
        });
      }
    } catch (e) {
      console.error("Error accessing iframe:", e);
      observer.disconnect();
      styleObserver.disconnect();

      // Utilise les dimensions par défaut et affiche la fenêtre
      applyCanvasDimensionsToWindow(600, 440);
      resizeWindow(600, 440);
      setTimeout(() => {
        showWindow();
        hideLoading();
      }, 100);
    }
  }

  // Démarre l'observation
  observer.observe(iframeDoc.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["style"],
  });

  checkGameReady();

  // Fallback
  const fallbackTimeout = setTimeout(() => {
    observer.disconnect();
    styleObserver.disconnect();
    console.log("Fallback: using default dimensions");
    applyCanvasDimensionsToWindow(600, 440);
    resizeWindow(600, 440);
    showWindow();
    hideLoading();
  }, 30000);

  const originalDisconnect = observer.disconnect;
  observer.disconnect = function () {
    clearTimeout(fallbackTimeout);
    originalDisconnect.call(this);
  };
}

function showWindow() {
  const windowElement = window.parent.document.getElementById(
    "window-Space Cadet Pinball"
  );
  const iframe = document.getElementById("pinball-frame");

  if (windowElement) {
    windowElement.style.visibility = "visible";
    windowElement.style.opacity = "1";

    console.log("Window is now visible");
  }

  if (iframe) {
    iframe.style.visibility = "visible";
  }
}

function hideLoading() {
  const loading = document.getElementById("loading");
  if (loading) {
    loading.style.opacity = "0";
    setTimeout(() => {
      loading.style.display = "none";
    }, 300);
  }
}

function applyCanvasDimensionsToWindow(canvasWidth, canvasHeight) {
  const headerHeight = 30;
  const borderWidth = 3;
  const totalWidth = canvasWidth + borderWidth;
  const totalHeight = canvasHeight + headerHeight;

  // Supprime les styles existants
  const existingStyles = window.parent.document.querySelectorAll(
    "style[data-pinball-resize]"
  );
  existingStyles.forEach((style) => style.remove());

  // Applique le nouveau style
  const style = document.createElement("style");
  style.setAttribute("data-pinball-resize", "true");
  style.textContent = `
    #window-Space\\ Cadet\\ Pinball.window {
      width: ${totalWidth}px !important;
      height: ${totalHeight}px !important;
      min-width: ${totalWidth}px !important;
      min-height: ${totalHeight}px !important;
      max-width: ${totalWidth}px !important;
      max-height: ${totalHeight}px !important;
    }
    #window-Space\\ Cadet\\ Pinball {
      height: ${canvasHeight}px !important;
      overflow: hidden !important;
    }
  `;
  window.parent.document.head.appendChild(style);

  console.log(
    `Canvas dimensions applied to CSS: ${canvasWidth}x${canvasHeight} -> Window: ${totalWidth}x${totalHeight}`
  );

  // Application immédiate des styles inline (sans setTimeout)
  applyInlineStyles(canvasWidth, canvasHeight, totalWidth, totalHeight);
}

function applyInlineStyles(canvasWidth, canvasHeight, totalWidth, totalHeight) {
  const windowElement = window.parent.document.getElementById(
    "window-Space Cadet Pinball"
  );

  if (windowElement) {
    windowElement.style.setProperty("width", `${totalWidth}px`, "important");
    windowElement.style.setProperty("height", `${totalHeight}px`, "important");
    console.log(
      `Inline styles applied to window: ${totalWidth}x${totalHeight}`
    );
  }
}

function resizeWindow(canvasWidth, canvasHeight) {
  let windowElement = window.parent.document.getElementById(
    "window-Space Cadet Pinball"
  );

  if (!windowElement) {
    windowElement = window.parent.document.querySelector(
      '[data-app-name="Space Cadet Pinball"]'
    );
  }

  if (windowElement) {
    const headerHeight = 30;
    const borderWidth = 3;
    const totalWidth = canvasWidth + borderWidth;
    const totalHeight = canvasHeight + headerHeight;

    windowElement.style.width = totalWidth + "px";
    windowElement.style.height = totalHeight + "px";

    console.log(
      `Window resized to: ${totalWidth}x${totalHeight} (canvas: ${canvasWidth}x${canvasHeight})`
    );
  } else {
    console.warn("Could not find window elements");
  }
}

function openSimpleModal(
  id,
  htmlContent,
  cssHref = "/Start_Menu/Log_Off/Base/Log_Off.css"
) {
  injectStyle("Log_Off-styles", cssHref);

  const modalDiv = document.createElement("div");
  modalDiv.id = id;
  modalDiv.innerHTML = htmlContent;
  modalDiv.style.position = "fixed";
  modalDiv.style.zIndex = "99999";
  modalDiv.style.left = "0";
  modalDiv.style.top = "0";
  modalDiv.style.width = "100vw";
  modalDiv.style.height = "100vh";

  document.body.appendChild(modalDiv);

  Array.from(document.body.children).forEach((child) => {
    if (child.id !== id) {
      child.classList.add("modal-open");
    }
  });

  const closeBtn = modalDiv.querySelector(".footer__button");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      Array.from(document.body.children).forEach((child) => {
        child.classList.remove("modal-open");
      });
      document.body.classList.remove("modal-open");
      modalDiv.remove();
    });
  }
}

function openLogOff() {
  openSimpleModal("Log_Off", openLogOffHTML);
}

function turnOffComputer() {
  openSimpleModal("Turn_Off_Computer", turnOffComputerHTML);
}
window.turnOffComputer = turnOffComputer;

function switchUser() {
  injectStyle("Switch_User-styles", "/Loader_Login/Login_Screen.css");

  const windows = Array.from(document.querySelectorAll('[id^="window-"]'));
  const windowStates = windows.map((win) => ({
    appName: win.id.replace("window-", ""),
    left: win.style.left,
    top: win.style.top,
    width: win.style.width,
    height: win.style.height,
    display: win.style.display,
    zIndex: win.style.zIndex,
  }));

  localStorage.setItem("openWindows", JSON.stringify(windowStates));
  localStorage.setItem("zIndexCounter", zIndexCounter);
  window.location.href = "/Start_Menu/Log_Off/Transition/Switch_User.html";
}

function logOff() {
  let icones = document.getElementById("desktop");
  let taskbarHidden = document.getElementById("Desktop_Footer");
  let logOff = document.getElementById("Log_Off");

  let step = 0;
  const interval = setInterval(() => {
    switch (step) {
      case 0:
        Array.from(document.body.children).forEach((child) => {
          child.classList.remove("modal-open");
        });
        document.body.classList.remove("modal-open");
        break;
      case 1:
        if (logOff) logOff.style.display = "none";
        if (icones) icones.style.display = "none";
        break;
      case 2:
        if (taskbarHidden) taskbarHidden.style.display = "none";
        break;
      case 3:
        clearInterval(interval);
        window.location.href = "/Start_Menu/Log_Off/Transition/Login.html";
        return;
    }
    step++;
  }, 250);
}

function PowerState(event) {
  const icones = document.getElementById("desktop");
  const taskbarHidden = document.getElementById("Desktop_Footer");
  const turnOffComputer = document.getElementById("Turn_Off_Computer");

  const targetId = event?.target?.id;

  localStorage.setItem("powerAction", targetId);

  let step = 0;
  const interval = setInterval(() => {
    switch (step) {
      case 0:
        Array.from(document.body.children).forEach((child) =>
          child.classList.remove("modal-open")
        );
        document.body.classList.remove("modal-open");
        break;
      case 1:
        if (turnOffComputer) turnOffComputer.style.display = "none";
        if (icones) icones.style.display = "none";
        break;
      case 2:
        if (taskbarHidden) taskbarHidden.style.display = "none";
        break;
      case 3:
        clearInterval(interval);
        window.location.href =
          "/Start_Menu/Turn_Off_Computer/Shut_Down/Shut_Down.html";
        break;
    }
    step++;
  }, 250);
}

function closeWindow(appName) {
  let windowElement = document.getElementById(`window-${appName}`);
  let taskbarItem = document.getElementById(`taskbar-${appName}`);

  if (windowElement) windowElement.remove();
  if (taskbarItem) taskbarItem.remove();

  const styleLink = document.getElementById(`css-window-${appName}`);
  if (styleLink && styleLink.tagName === "LINK") styleLink.remove();

  updateTaskbarVisibility();
}

function toggleWindow(appName) {
  const windowElement = document.getElementById(`window-${appName}`);
  const taskbarItem = document.getElementById(`taskbar-${appName}`);

  if (!windowElement || !taskbarItem) return;

  const isHidden = windowElement.style.display === "none";
  const isInactive = windowElement.classList.contains("window-inactive");

  if (isInactive && !isHidden) {
    return;
  }

  const isOnTop = parseInt(windowElement.style.zIndex) === zIndexCounter;

  if (isHidden) {
    windowElement.style.removeProperty("display");
    windowElement.classList.remove("window-inactive");
    zIndexCounter++;
    windowElement.style.zIndex = zIndexCounter;

    updateTaskbarHighlight(appName, true);
  } else {
    if (isOnTop) {
      windowElement.style.display = "none";
      windowElement.classList.add("window-inactive");

      updateTaskbarHighlight(appName, false);
    } else {
      zIndexCounter++;
      windowElement.style.zIndex = zIndexCounter;

      updateTaskbarHighlight(appName, true);
    }
  }
}

function maximazeWindow(appName) {
  const windowElement = document.getElementById(`window-${appName}`);
  const taskbarItem = document.getElementById(`taskbar-${appName}`);

  if (!windowElement || !taskbarItem) return;

  const footerHeight = 35;

  const maxWidth = document.documentElement.clientWidth;
  const maxHeight = document.documentElement.clientHeight - footerHeight;

  const isMaximized = windowElement.dataset.maximized === "true";

  const maximizeButton = windowElement.querySelector(
    ".header-button--maximaze, .header_button--maximized"
  );

  if (!isMaximized) {
    windowElement.dataset.originalWidth = windowElement.offsetWidth;
    windowElement.dataset.originalHeight = windowElement.offsetHeight;
    windowElement.dataset.originalLeft = windowElement.style.left;
    windowElement.dataset.originalTop = windowElement.style.top;

    windowElement.style.left = "0px";
    windowElement.style.top = "0px";
    windowElement.style.width = `${maxWidth}px`;
    windowElement.style.height = `${maxHeight}px`;

    windowElement.dataset.maximized = "true";

    windowElement.style.zIndex = zIndexCounter;

    maximizeButton.classList.remove("header-button--maximaze");
    maximizeButton.classList.remove("header_button--maximaze");
    maximizeButton.classList.add("header-button--maximized");
    maximizeButton.classList.add("header_button--maximized");

    updateTaskbarHighlight(appName, true);
  } else {
    windowElement.style.width = `${windowElement.dataset.originalWidth}px`;
    windowElement.style.height = `${windowElement.dataset.originalHeight}px`;
    windowElement.style.left = windowElement.dataset.originalLeft;
    windowElement.style.top = windowElement.dataset.originalTop;

    windowElement.dataset.maximized = "false";

    windowElement.style.zIndex = zIndexCounter;

    maximizeButton.classList.remove("header-button--maximized");
    maximizeButton.classList.remove("header_button--maximized");
    maximizeButton.classList.add("header-button--maximaze");
    maximizeButton.classList.add("header_button--maximaze");

    updateTaskbarHighlight(appName, false);
  }
}

function makeDraggable(element) {
  let header = element.querySelector(".window-header");

  let offsetX = 0,
    offsetY = 0,
    isDragging = false;

  header.addEventListener("mousedown", (e) => {
    if (isResizingGlobal) return;

    isDragging = true;
    offsetX = e.clientX - element.offsetLeft;
    offsetY = e.clientY - element.offsetTop;

    element.style.zIndex = zIndexCounter;

    updateTaskbarHighlight();

    document.addEventListener("mousemove", moveWindow);
    document.addEventListener("mouseup", () => {
      isDragging = false;
      document.removeEventListener("mousemove", moveWindow);
    });
  });

  function moveWindow(e) {
    if (isDragging) {
      let newX = e.clientX - offsetX;
      let newY = e.clientY - offsetY;

      let screenWidth = window.innerWidth;
      let screenHeight = window.innerHeight;
      let windowWidth = element.offsetWidth;
      let windowHeight = element.offsetHeight;

      newX = Math.max(0, Math.min(screenWidth - windowWidth, newX));
      newY = Math.max(0, Math.min(screenHeight - windowHeight, newY));

      element.style.left = `${newX}px`;
      element.style.top = `${newY}px`;
    }
  }
  element.addEventListener("mousedown", () => {
    zIndexCounter++;
    element.style.zIndex = zIndexCounter;
    updateTaskbarHighlight();
  });
}

function makeResizable(windowElement) {
  const minWidth = 150;
  const minHeight = 115;
  let isResizing = false;
  let startX,
    startY,
    startWidth,
    startHeight,
    startTop,
    startLeft,
    resizeDir = "";
  let iframe;

  windowElement.addEventListener("mousedown", (e) => {
    const rect = windowElement.getBoundingClientRect();
    const borderSize = 2;

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const onLeft = mouseX >= rect.left && mouseX <= rect.left + borderSize;
    const onRight = mouseX >= rect.right - borderSize && mouseX <= rect.right;
    const onTop = mouseY >= rect.top && mouseY <= rect.top + borderSize;
    const onBottom =
      mouseY >= rect.bottom - borderSize && mouseY <= rect.bottom;

    resizeDir = "";
    if (onRight) resizeDir += "e";
    if (onLeft) resizeDir += "w";
    if (onTop) resizeDir += "n";
    if (onBottom) resizeDir += "s";

    if (resizeDir !== "") {
      isResizing = true;
      isResizingGlobal = true;
      startX = e.clientX;
      startY = e.clientY;
      startWidth = rect.width;
      startHeight = rect.height;
      startTop = rect.top;
      startLeft = rect.left;

      iframe = windowElement.querySelector("iframe");
      if (iframe) iframe.style.pointerEvents = "none";

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
      e.preventDefault();
    }
  });

  windowElement.addEventListener("mousemove", (e) => {
    if (isResizing) {
      if (resizeDir.includes("n") && resizeDir.includes("e")) {
        windowElement.style.cursor = "nesw-resize";
      } else if (resizeDir.includes("s") && resizeDir.includes("w")) {
        windowElement.style.cursor = "nesw-resize";
      } else if (resizeDir.includes("n") && resizeDir.includes("w")) {
        windowElement.style.cursor = "nwse-resize";
      } else if (resizeDir.includes("s") && resizeDir.includes("e")) {
        windowElement.style.cursor = "nwse-resize";
      } else if (resizeDir.includes("e") || resizeDir.includes("w")) {
        windowElement.style.cursor = "ew-resize";
      } else if (resizeDir.includes("n") || resizeDir.includes("s")) {
        windowElement.style.cursor = "ns-resize";
      }
      return;
    }

    const rect = windowElement.getBoundingClientRect();
    const borderSize = 2;

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const onLeft = mouseX >= rect.left && mouseX <= rect.left + borderSize;
    const onRight = mouseX >= rect.right - borderSize && mouseX <= rect.right;
    const onTop = mouseY >= rect.top && mouseY <= rect.top + borderSize;
    const onBottom =
      mouseY >= rect.bottom - borderSize && mouseY <= rect.bottom;

    if ((onLeft && onTop) || (onRight && onBottom)) {
      windowElement.style.cursor = "nwse-resize";
    } else if ((onRight && onTop) || (onLeft && onBottom)) {
      windowElement.style.cursor = "nesw-resize";
    } else if (onLeft || onRight) {
      windowElement.style.cursor = "ew-resize";
    } else if (onTop || onBottom) {
      windowElement.style.cursor = "ns-resize";
    } else {
      windowElement.style.cursor = "default";
    }
  });

  function onMouseMove(e) {
    if (!isResizing) return;

    let dx = e.clientX - startX;
    let dy = e.clientY - startY;

    if (resizeDir.includes("e")) {
      let newWidth = startWidth + dx;
      if (newWidth < minWidth) {
        newWidth = minWidth;
      }
      windowElement.style.width = newWidth + "px";
    }

    if (resizeDir.includes("s")) {
      let newHeight = startHeight + dy;
      if (newHeight < minHeight) {
        newHeight = minHeight;
      }
      windowElement.style.height = newHeight + "px";
    }

    if (resizeDir.includes("w")) {
      let newWidth = startWidth - dx;
      let newLeft = startLeft + dx;

      if (newWidth < minWidth) {
        newLeft -= minWidth - newWidth;
        newWidth = minWidth;
      }

      windowElement.style.width = newWidth + "px";
      windowElement.style.left = newLeft + "px";
    }

    if (resizeDir.includes("n")) {
      let newHeight = startHeight - dy;
      let newTop = startTop + dy;

      if (newHeight < minHeight) {
        newTop -= minHeight - newHeight;
        newHeight = minHeight;
      }

      windowElement.style.height = newHeight + "px";
      windowElement.style.top = newTop + "px";
    }
  }

  function onMouseUp() {
    isResizing = false;
    isResizingGlobal = false;
    if (iframe) iframe.style.pointerEvents = "auto";
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }
}

function updateTaskbarHighlight() {
  const windows = Array.from(document.querySelectorAll(".window")).filter(
    (win) => win.style.display !== "none"
  );

  const webampDiv = document.getElementById("webamp");
  if (
    webampDiv &&
    webampDiv.style.display !== "none" &&
    !windows.includes(webampDiv)
  ) {
    windows.push(webampDiv);
  }

  let topWindow = null;
  let maxZ = -1;
  windows.forEach((win) => {
    const z = parseInt(win.style.zIndex || 0, 10);
    if (z > maxZ) {
      maxZ = z;
      topWindow = win;
    }
  });

  document.querySelectorAll(".taskbar-item").forEach((item) => {
    item.style.backgroundColor = "";
    item.style.boxShadow = "";
  });

  windows.forEach((win) => {
    const isTop = win === topWindow;
    const headerBg =
      win.querySelector && win.querySelector(".window-header-background");
    const headerButtons =
      win.querySelector && win.querySelector(".window-header-buttons");

    if (isTop) {
      win.classList.remove("window-inactive");
      win.style.backgroundColor = "";
      if (headerBg) headerBg.style.background = "";
      if (headerButtons) headerButtons.style.opacity = "1";
    } else {
      win.classList.add("window-inactive");
      if (headerBg) {
        headerBg.style.background =
          "linear-gradient(rgb(118, 151, 231) 0%, rgb(126, 158, 227) 3%, rgb(148, 175, 232) 6%, rgb(151, 180, 233) 8%, rgb(130, 165, 228) 14%, rgb(124, 159, 226) 17%, rgb(121, 150, 222) 25%, rgb(123, 153, 225) 56%, rgb(130, 169, 233) 81%, rgb(128, 165, 231) 89%, rgb(123, 150, 225) 94%, rgb(122, 147, 223) 97%, rgb(171, 186, 227) 115%)";
      }
      if (headerButtons) headerButtons.style.opacity = "0.4";
    }
  });

  if (topWindow) {
    let topAppId;
    if (topWindow.id === "webamp") {
      topAppId = "Winamp";
    } else {
      topAppId = topWindow.id.replace("window-", "");
    }
    const taskbarItem = document.getElementById(`taskbar-${topAppId}`);
    if (taskbarItem) {
      taskbarItem.style.backgroundColor = "rgba(26, 80, 183, 1)";
      taskbarItem.style.boxShadow =
        "rgba(0, 0, 0, 0.2) 0px 0px 1px 1px inset, rgba(0, 0, 0, 0.7) 1px 0px 1px inset";
    }
  }

  if (!updateTaskbarHighlight._blurListenerAdded) {
    document.addEventListener("mousedown", (event) => {
      const windows = Array.from(document.querySelectorAll(".window")).filter(
        (win) => win.style.display !== "none"
      );
      const webampDiv = document.getElementById("webamp");
      if (
        webampDiv &&
        webampDiv.style.display !== "none" &&
        !windows.includes(webampDiv)
      ) {
        windows.push(webampDiv);
      }

      let clickedOnWindow = null;
      let clickedOnTaskbar = null;

      windows.forEach((win) => {
        let appId;
        if (win.id === "webamp") {
          appId = "Winamp";
        } else {
          appId = win.id.replace("window-", "");
        }
        const taskbarItem = document.getElementById(`taskbar-${appId}`);
        if (win.contains(event.target)) {
          clickedOnWindow = win;
        }
        if (taskbarItem && taskbarItem.contains(event.target)) {
          clickedOnTaskbar = win;
        }
      });

      if (!clickedOnWindow && !clickedOnTaskbar) {
        windows.forEach((win) => {
          win.classList.add("window-inactive");
          const headerBg =
            win.querySelector && win.querySelector(".window-header-background");
          const headerButtons =
            win.querySelector && win.querySelector(".window-header-buttons");
          if (headerBg) {
            headerBg.style.background =
              "linear-gradient(rgb(118, 151, 231) 0%, rgb(126, 158, 227) 3%, rgb(148, 175, 232) 6%, rgb(151, 180, 233) 8%, rgb(130, 165, 228) 14%, rgb(124, 159, 226) 17%, rgb(121, 150, 222) 25%, rgb(123, 153, 225) 56%, rgb(130, 169, 233) 81%, rgb(128, 165, 231) 89%, rgb(123, 150, 225) 94%, rgb(122, 147, 223) 97%, rgb(171, 186, 227) 115%)";
          }
          if (headerButtons) headerButtons.style.opacity = "0.4";
        });
        document.querySelectorAll(".taskbar-item").forEach((item) => {
          item.style.backgroundColor = "";
          item.style.boxShadow = "";
        });
      } else {
        const win = clickedOnWindow || clickedOnTaskbar;
        if (win && win.classList.contains("window-inactive")) {
          win.classList.remove("window-inactive");
          zIndexCounter++;
          win.style.zIndex = zIndexCounter;
          updateTaskbarHighlight();
        }
      }
    });
    updateTaskbarHighlight._blurListenerAdded = true;
  }
}

function createTaskbar() {
  if (!document.getElementById("taskbar")) {
    let taskbar = document.createElement("div");
    taskbar.id = "taskbar";

    let start_menu = document.querySelector(".footer__start_menu");

    start_menu.insertAdjacentElement("afterend", taskbar);
  }
}

function updateTaskbarVisibility() {
  let taskbar = document.getElementById("taskbar");
  if (taskbar && taskbar.children.length === 0) {
    taskbar.remove();
  }
}

function openStartMenu() {
  if (recentlyClosedStartMenu) return;
  injectStyle("StartMenu-styles", "/Start_Menu/Base/Start_Menu.css");

  if (!startMenuHTML) return;

  const container = document.querySelector(".footer__start_menu");
  if (!container) return;

  const existingMenu = container.querySelector("#StartMenu");
  if (existingMenu) {
    existingMenu.remove();
    recentlyClosedStartMenu = true;
    setTimeout(() => {
      recentlyClosedStartMenu = false;
    }, 115);
    return;
  }

  const StartMenu = document.createElement("div");
  StartMenu.id = "StartMenu";
  StartMenu.innerHTML = startMenuHTML;

  setTimeout(() => {
    container.appendChild(StartMenu);
    attachHoverTooltip();

    document.addEventListener("mousedown", handleOutsideClick);
  }, 10);

  function handleOutsideClick(e) {
    setTimeout(() => {
      const startMenu = document.getElementById("StartMenu");
      if (startMenu && !startMenu.contains(e.target)) {
        startMenu.remove();
        document.removeEventListener("mousedown", handleOutsideClick);

        recentlyClosedStartMenu = true;
        setTimeout(() => {
          recentlyClosedStartMenu = false;
        }, 115);
      }
    }, 0);
  }
}

function attachHoverTooltip() {
  injectStyle(
    "hover-info-styles",
    "/Start_Menu/All_Programs/Tooltip/tooltip.css"
  );
  let tooltipHierarchy = [];

  const menu =
    document.querySelector(".AllProgMenu") ||
    document.querySelector(".ItemMenu");

  if (!menu) return;

  const createTooltip = (content, parent) => {
    let level = 0;

    const tooltip = document.createElement("div");
    tooltip.className = "hover-info";
    tooltip.innerHTML = content;

    const infoitm = parent.closest(".hover-infoitm");
    const tooltipParent = parent.closest(".hover-info");

    if (infoitm && tooltipParent) {
      const rectInfoitm = infoitm.getBoundingClientRect();
      const rectTooltip = tooltipParent.getBoundingClientRect();

      const ecart = rectTooltip.bottom - rectInfoitm.bottom;

      //console.log("Écart (info - itm) :", ecart);
    }

    const rect = parent.getBoundingClientRect();
    console.log("Parent Rect:", rect);

    tooltip.style.visibility = "hidden";
    tooltip.style.position = "absolute";
    document.body.appendChild(tooltip);

    const parentTooltip = parent.closest(".hover-info");
    const specificTooltip = parent.closest(".hover-infotxt");

    if (parentTooltip && parentTooltip.dataset.level) {
      level = parseInt(parentTooltip.dataset.level, 10) + 1;
    }

    tooltip.dataset.level = level.toString();

    let tooltipName = "";
    const infotxt = parent.querySelector(".hover-infotxt");
    if (infotxt) {
      tooltipName = infotxt.textContent.trim();
    }

    if (level === 0) {
      tooltip.style.visibility = "";
      tooltip.style.left = `${rect.right}px`;
      tooltip.style.top = `${405 - rect.height}px`;
    } else if (tooltipName === "Accessories") {
      tooltip.style.visibility = "";
      tooltip.style.left = `${rect.right - 112}px`;
      tooltip.style.top = `${rect.height - 30}px`;
    } else if (tooltipName === "Games") {
      tooltip.style.visibility = "";
      tooltip.style.left = `${rect.right - 112}px`;
      tooltip.style.top = `${rect.height - 22}px`;
    } else if (tooltipName === "Startup") {
      tooltip.style.visibility = "";
      tooltip.style.left = `${rect.right - 112}px`;
      tooltip.style.top = `${rect.height - 3}px`;
    } else if (tooltipName === "Accessibility") {
      tooltip.style.visibility = "";
      tooltip.style.left = `${rect.right - 329}px`;
      tooltip.style.top = `${rect.height + 90}px`;
    } else if (tooltipName === "Communication") {
      tooltip.style.visibility = "";
      tooltip.style.left = `${rect.right - 329}px`;
      tooltip.style.top = `${rect.height + 90}px`;
    } else if (tooltipName === "Entertainement") {
      tooltip.style.visibility = "";
      tooltip.style.left = `${rect.right - 329}px`;
      tooltip.style.top = `${rect.height + 44}px`;
    } else if (tooltipName === "System Tools") {
      tooltip.style.visibility = "";
      tooltip.style.left = `${rect.right - 329}px`;
      tooltip.style.top = `${rect.height + 182}px`;
    }

    const itemMenu = parent.closest(".ItemMenu");
    if (itemMenu && itemMenu.id === "Connect To") {
      tooltip.style.left = `${rect.right + 48}px`;
      tooltip.style.top = `${rect.height + 256}px`;
    } else if (itemMenu && itemMenu.id === "My Recent Documents") {
      tooltip.style.left = `${rect.right + 48}px`;
      tooltip.style.top = `${rect.height + 34}px`;
    }

    tooltip.style.zIndex = 9999;

    if (parent.classList.contains("AllProgTxt")) {
      parent.appendChild(tooltip);
    } else if (parent.classList.contains("hover-infotxt")) {
      parent.appendChild(tooltip);
    } else if (specificTooltip) {
      specificTooltip.appendChild(tooltip);
    } else {
      parent.appendChild(tooltip);
    }
    return tooltip;
  };

  const closeAllTooltips = () => {
    tooltipHierarchy.forEach((t) => t.remove());
    tooltipHierarchy = [];
  };

  const isMouseOverAnyTooltip = () => {
    return (
      tooltipHierarchy.some((t) => t.matches(":hover")) ||
      menu.matches(":hover") ||
      document.querySelector(".ItemMenu:hover") ||
      document.querySelector(".hover-infoitm:hover") ||
      document.querySelector(".hover-infotxt:hover")
    );
  };
  const scheduleTooltipClose = () => {
    if (!isMouseOverAnyTooltip()) {
      closeAllTooltips();
    }
  };

  const handleMouseEnter = async (e) => {
    const target = e.target.closest(".AllProgMenu, .ItemMenu, .hover-infoitm");
    if (!target) return;

    let contentFile = null;

    const textElement = target.querySelector(".hover-infotxt");
    const allowedTexts = [
      "Accessories",
      "Games",
      "Startup",
      "Accessibility",
      "Communication",
      "Entertainement",
      "System Tools",
    ];

    if (textElement) {
      const text = textElement.textContent.trim();
      if (allowedTexts.includes(text)) {
        contentFile = `/Start_Menu/All_Programs/Sub_Tooltip/${text}.html`;
      }
    }

    if (!contentFile) {
      const textTest = target.querySelector(".AllProgTxt");
      if (textTest) {
        const text = textTest.textContent.trim();
        if (text === "All Programs") {
          contentFile = "/Start_Menu/All_Programs/Tooltip/Tooltip.html";
        }
      }
    }

    if (!contentFile) {
      let itemMenu = null;
      if (
        target.classList &&
        target.classList.contains("ItemMenu") &&
        (target.id === "Connect To" || target.id === "My Recent Documents")
      ) {
        itemMenu = target;
        contentFile = `/Start_Menu/Tooltip/${itemMenu.id}.html`;
      }
      if (!itemMenu) return;
    }

    if (!contentFile) return;

    if (!target.dataset.tooltipId) {
      target.dataset.tooltipId = `tt-${Date.now()}-${Math.random().toString(
        36
      )}`;
    }

    const existing = tooltipHierarchy.find(
      (t) =>
        t.dataset.parent === target.dataset.tooltipId &&
        t.dataset.file === contentFile
    );
    if (existing) return;

    const content = await loadHTML(contentFile);
    const tooltip = createTooltip(content, target);

    attachTooltipListeners(tooltip);

    const text = textElement ? textElement.textContent.trim() : "";
    if (allowedTexts.includes(text)) {
      target.addEventListener("mouseleave", function onLeave() {
        tooltip.remove();
        tooltipHierarchy = tooltipHierarchy.filter((t) => t !== tooltip);
        target.removeEventListener("mouseleave", onLeave);
      });
    }

    const currentLevel = parseInt(tooltip.dataset.level, 10);

    tooltipHierarchy = tooltipHierarchy.filter((t) => {
      const tooltipLevel = parseInt(t.dataset.level, 10);
      if (tooltipLevel === currentLevel && t !== tooltip) {
        t.remove();
        return false;
      }
      return true;
    });

    tooltip.dataset.parent = target.dataset.tooltipId;
    tooltip.dataset.file = contentFile;

    tooltipHierarchy.push(tooltip);
  };

  let lastActiveLevel = null;

  const attachTooltipListeners = (tooltip) => {
    tooltip.addEventListener("mouseenter", (e) => {
      const currentLevel = parseInt(e.currentTarget.dataset.level, 10);

      if (lastActiveLevel !== null && currentLevel < lastActiveLevel) {
        setTimeout(() => {
          tooltipHierarchy = tooltipHierarchy.filter((t) => {
            const tooltipLevel = parseInt(t.dataset.level, 10);
            if (tooltipLevel > currentLevel) {
              t.remove();
              return false;
            }
            return true;
          });
        }, 250);
      }
    });

    tooltip.addEventListener("mouseleave", (e) => {
      const leavingLevel = parseInt(e.currentTarget.dataset.level, 10);
      lastActiveLevel = leavingLevel;
    });
  };

  if (hoverTooltipMouseEnterHandler) {
    document.body.removeEventListener(
      "mouseenter",
      hoverTooltipMouseEnterHandler,
      true
    );
  }
  if (hoverTooltipMouseLeaveHandler) {
    document.body.removeEventListener(
      "mouseleave",
      hoverTooltipMouseLeaveHandler,
      true
    );
  }

  hoverTooltipMouseEnterHandler = function (e) {
    if (e.target.closest(".AllProgMenu, .ItemMenu, .hover-infoitm")) {
      handleMouseEnter(e);
    }
  };
  hoverTooltipMouseLeaveHandler = function () {
    scheduleTooltipClose();
  };

  document.body.addEventListener(
    "mouseenter",
    hoverTooltipMouseEnterHandler,
    true
  );
  document.body.addEventListener(
    "mouseleave",
    hoverTooltipMouseLeaveHandler,
    true
  );
}

function injectStyle(id, href) {
  const cssId = `css-${id}`;
  if (!document.getElementById(cssId)) {
    const link = document.createElement("link");
    link.id = cssId;
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }
}

document.addEventListener("mousedown", function (event) {
  document.querySelectorAll(".window").forEach((windowEl) => {
    const labelDivs = windowEl.querySelectorAll(".drop_down_label");
    let tooltip = windowEl.querySelector(
      ".tooltip, .window-tooltip, .hover-info"
    );
    if (!tooltip) return;

    const isOnLabel = Array.from(labelDivs).some((label) =>
      label.contains(event.target)
    );
    const isOnTooltip = tooltip.contains(event.target);

    if (!isOnLabel && !isOnTooltip) {
      tooltip.parentNode.removeChild(tooltip);
    }
  });
});

document.addEventListener("click", function (event) {
  const tooltip = event.target.closest(".window-tooltip");
  if (tooltip) {
    tooltip.remove();
  }
});

setTimeout(() => {
  const windowStates = JSON.parse(localStorage.getItem("openWindows") || "[]");
  windowStates.forEach(
    ({ appName, left, top, width, height, display, zIndex }) => {
      openWindow(appName);

      const win = document.getElementById(`window-${appName}`);
      if (win) {
        win.classList.add("window-inactive");
        if (left) win.style.left = left;
        if (top) win.style.top = top;
        if (width) win.style.width = width;
        if (height) win.style.height = height;
        if (display) win.style.display = display;
        if (zIndex) win.style.zIndex = zIndex;
      }
    }
  );
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
  }
  localStorage.removeItem("openWindows");
  localStorage.removeItem("zIndexCounter");
}, 200);

function writeDateTime() {
  const textarea = document.querySelector(".write");
  const now = new Date();

  const dateOptions = { year: "numeric", month: "2-digit", day: "2-digit" };
  const timeOptions = { hour: "2-digit", minute: "2-digit" };

  const dateStr = now.toLocaleDateString("en-US", dateOptions);
  const timeStr = now.toLocaleTimeString("en-US", timeOptions);

  textarea.value += `${timeStr} ${dateStr} \n`;
}
