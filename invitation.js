(function () {
  const invitationSlug = "hesham-alaa-july-2026";
  const invitationDateLabel = "02/07/2026";
  const venueName = "Stage El-Nile"; 

  const introOverlay = document.getElementById("introOverlay");
  const introVideo = document.getElementById("introVideo");
  const invitationPage = document.getElementById("invitationPage");
  const heroCopy = document.getElementById("heroCopy");
  const backgroundAudio = document.getElementById("backgroundAudio");
  const audioToggle = document.getElementById("audioToggle");
  const countdownRoot = document.querySelector(".hero-countdown-section");
  const rsvpForm = document.getElementById("rsvpForm");
  const submitButton = document.getElementById("submitButton");
  const formError = document.getElementById("formError");
  const formSuccess = document.getElementById("formSuccess");
  const guestCountInput = document.getElementById("guestCount");
  const guestCountValue = document.getElementById("guestCountValue");
  const guestPassWrap = document.getElementById("guestPassWrap");
  const guestPassName = document.getElementById("guestPassName");
  const guestPassGuests = document.getElementById("guestPassGuests");
  const guestPassCode = document.getElementById("guestPassCode");
  const guestPassCodeText = document.getElementById("guestPassCodeText");
  const guestPassBarcode = document.getElementById("guestPassBarcode");
  const downloadPassButton = document.getElementById("downloadPassButton");
  const revealSections = Array.from(document.querySelectorAll(".invitation-reveal-section"));
  const revealItems = Array.from(document.querySelectorAll(".reveal-on-scroll"));
  
  let started = false;
  let introFinished = false; 
  let latestGuestPass = null;

  function pad(value) {
    return String(Math.max(value, 0)).padStart(2, "0");
  }

  function setFeedback(target, text) {
    if (!target) {
      return;
    }

    if (!text) {
      target.hidden = true;
      target.textContent = "";
      return;
    }

    target.hidden = false;
    target.textContent = text;
  }

  function updateCountdown() {
    if (!countdownRoot) {
      return;
    }

    const launchRaw = countdownRoot.getAttribute("data-launch");
    const launchDate = launchRaw ? new Date(launchRaw).getTime() : new Date("2026-07-02T00:00:00").getTime();

    if (isNaN(launchDate)) {
      return;
    }

    const diff = launchDate - Date.now();
    const safeDiff = Math.max(diff, 0);
    const days = Math.floor(safeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((safeDiff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((safeDiff / (1000 * 60)) % 60);
    const seconds = Math.floor((safeDiff / 1000) % 60);

    const daysEl = countdownRoot.querySelector('[data-unit="days"]');
    const hoursEl = countdownRoot.querySelector('[data-unit="hours"]');
    const minutesEl = countdownRoot.querySelector('[data-unit="minutes"]');
    const secondsEl = countdownRoot.querySelector('[data-unit="seconds"]');

    if (daysEl) daysEl.textContent = pad(days);
    if (hoursEl) hoursEl.textContent = pad(hours);
    if (minutesEl) minutesEl.textContent = pad(minutes);
    if (secondsEl) secondsEl.textContent = pad(seconds);
  }

  async function startBackgroundMusic() {
    if (!backgroundAudio) {
      return;
    }

    try {
      backgroundAudio.volume = 0.55;
      backgroundAudio.muted = false;
      await backgroundAudio.play();
      if (audioToggle) {
        audioToggle.hidden = false;
        audioToggle.classList.remove("is-muted");
        audioToggle.setAttribute("aria-label", "Mute invitation music");
      }
    } catch (error) {
      if (audioToggle) {
        audioToggle.hidden = false;
        audioToggle.classList.add("is-muted");
        audioToggle.setAttribute("aria-label", "Play invitation music");
      }
    }
  }

  async function startExperience() {
    if (started) {
      finishIntro();
      return;
    }

    started = true;
    introOverlay.classList.add("is-playing");
    startBackgroundMusic();

    setTimeout(() => {
      finishIntro();
    }, 6000); 

    try {
      const playPromise = introVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          finishIntro();
        });
      }
    } catch (error) {
      finishIntro();
    }
  }

  function finishIntro() {
    if (introFinished) return;
    introFinished = true;

    introOverlay.classList.add("is-finished");
    invitationPage.classList.add("is-ready");
    invitationPage.setAttribute("aria-hidden", "false");
    document.body.classList.remove("is-locked");
    if (heroCopy) {
      heroCopy.classList.add("is-active");
    }
    startRevealObserver();
  }

  function startRevealObserver() {
    if (!("IntersectionObserver" in window)) {
      revealSections.forEach((section) => section.classList.add("is-visible"));
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.2 }
    );

    revealSections.forEach((section) => observer.observe(section));
    revealItems.forEach((item) => observer.observe(item));
  }

  function updateGuestCount(nextValue) {
    const safeValue = Math.max(1, Math.min(8, nextValue));
    if (guestCountInput) {
      guestCountInput.value = String(safeValue);
    }
    if (guestCountValue) {
      guestCountValue.textContent = String(safeValue);
    }
  }

  function buildEntryCode(attendeesCount) {
    return "HESH" + String(attendeesCount).padStart(2, "0");
  }

  function renderGuestPass(pass) {
    latestGuestPass = pass;
    const entryCode = buildEntryCode(pass.attendeesCount);

    if (guestPassName) {
      guestPassName.textContent = pass.guestName;
    }
    if (guestPassGuests) {
      guestPassGuests.textContent = String(pass.attendeesCount) + " ضيوف";
    }
    if (guestPassCode) {
      guestPassCode.textContent = entryCode;
    }
    if (guestPassCodeText) {
      guestPassCodeText.textContent = entryCode;
    }
    if (guestPassWrap) {
      guestPassWrap.hidden = false;
    }
  }

  function bindGuestStepper() {
    const decrementButton = document.getElementById("decrementGuest");
    const incrementButton = document.getElementById("incrementGuest");

    if (decrementButton) {
      decrementButton.addEventListener("click", () => {
        if (!guestCountInput) return;
        const current = parseInt(guestCountInput.value, 10) || 1;
        updateGuestCount(current - 1);
      });
    }

    if (incrementButton) {
      incrementButton.addEventListener("click", () => {
        if (!guestCountInput) return;
        const current = parseInt(guestCountInput.value, 10) || 1;
        updateGuestCount(current + 1);
      });
    }
  }

  async function handleRsvpSubmit(event) {
    event.preventDefault();
    setFeedback(formError, "");
    setFeedback(formSuccess, "");

    const guestName = document.getElementById("guestName").value.trim();
    const guestPhone = document.getElementById("guestPhone").value.trim();
    const attendeesCount = parseInt(guestCountInput.value, 10) || 1;

    if (!guestName || !guestPhone) {
      setFeedback(formError, "يرجى تعبئة جميع الحقول المطلوبة.");
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "جاري الإرسال...";

    // محاكاة إرسال البيانات
    setTimeout(() => {
      submitButton.textContent = "تم التأكيد بنجاح";
      setFeedback(formSuccess, "تم تأكيد حضوركم بنجاح، بانتظاركم!");
      
      renderGuestPass({
        guestName,
        attendeesCount
      });
      
      rsvpForm.reset();
      updateGuestCount(1);
    }, 1200);
  }

  function downloadGuestPass() {
    if (!guestPassWrap) return;
    alert("سيتم تحميل بطاقة الدخول قريباً.");
  }

  function bindAudioToggle() {
    if (!audioToggle || !backgroundAudio) return;

    audioToggle.addEventListener("click", async function () {
      if (backgroundAudio.paused || backgroundAudio.muted) {
        try {
          backgroundAudio.muted = false;
          await backgroundAudio.play();
          audioToggle.classList.remove("is-muted");
          audioToggle.setAttribute("aria-label", "Mute invitation music");
        } catch (error) {
          audioToggle.classList.add("is-muted");
          audioToggle.setAttribute("aria-label", "Play invitation music");
        }
        return;
      }

      backgroundAudio.muted = true;
      audioToggle.classList.add("is-muted");
      audioToggle.setAttribute("aria-label", "Play invitation music");
    });
  }

  if (introVideo) {
    introVideo.addEventListener("ended", finishIntro);
    introVideo.addEventListener("error", finishIntro);
  }

  if (introOverlay) {
    introOverlay.addEventListener("click", startExperience);
    introOverlay.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        startExperience();
      }
    });
  }

  if (rsvpForm) {
    rsvpForm.addEventListener("submit", handleRsvpSubmit);
  }

  if (guestPassWrap) {
    guestPassWrap.hidden = true;
  }

  if (downloadPassButton) {
    downloadPassButton.addEventListener("click", function () {
      downloadGuestPass(latestGuestPass);
    });
  }

  bindGuestStepper();
  bindAudioToggle();
  updateCountdown();
  window.setInterval(updateCountdown, 1000);
})();