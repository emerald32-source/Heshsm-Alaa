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
  let introFinished = false; // تمت إضافة هذا المتغير لمنع تكرار فتح الدعوة
  let latestGuestPass = null;
  let fallbackTimeout; // متغير لتخزين المؤقت الاحتياطي

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
    // السماح للزائر بتخطي الفيديو والدخول مباشرة إذا قام بالضغط مرة أخرى
    if (started) {
      finishIntro();
      return;
    }

    started = true;
    introOverlay.classList.add("is-playing");
    startBackgroundMusic();

    // تشغيل مؤقت احتياطي (Timeout) لمدة 8 ثواني كخطة بديلة
    fallbackTimeout = setTimeout(() => {
      finishIntro();
    }, 8000); 

    try {
      const playPromise = introVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          // إذا رفض المتصفح أو السيرفر تشغيل الفيديو، ادخل مباشرة
          clearTimeout(fallbackTimeout);
          finishIntro();
        });
      }
    } catch (error) {
      clearTimeout(fallbackTimeout);
      finishIntro();
    }
  }

  function finishIntro() {
    if (introFinished) return; // منع التكرار
    introFinished = true;
    if (fallbackTimeout) clearTimeout(fallbackTimeout); // إلغاء المؤقت الاحتياطي إذا انتهى الفيديو بنجاح

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
      {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.2
      }
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
      guestPassGuests.textContent = String(pass.attendeesCount);
    }
    if (guestPassCode) {
      guestPassCode.textContent = entryCode;
    }
    if (guestPassCodeText) {
      guestPassCodeText.textContent = entryCode;
    }
    if (guestPassBarcode) {
      guestPassBarcode.innerHTML = "";
      Array.from({ length: 30 }, function (_, index) {
        return {
          height: index % 5 === 0 ? 28 : index % 3 === 0 ? 22 : 18,
          width: index % 4 === 0 ? 3 : 2
        };
      }).forEach(function (bar) {
        const node = document.createElement("span");
        node.className = "guest-pass-bar";
        node.style.height = bar.height + "px";
        node.style.width = bar.width + "px";
        guestPassBarcode.appendChild(node);
      });
    }

    if (guestPassWrap) {
      guestPassWrap.hidden = false;
    }
  }

  function drawRoundedRect(context, x, y, width, height, radius) {
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height - radius);
    context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    context.lineTo(x + radius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
  }

  async function downloadGuestPass(pass) {
    if (!pass) {
      return;
    }

    try {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
    } catch (error) {
      // Keep download available even if font loading is unsupported.
    }

    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    const entryCode = buildEntryCode(pass.attendeesCount);
    const backgroundGradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    backgroundGradient.addColorStop(0, "#faf5ff");
    backgroundGradient.addColorStop(1, "#e6dbf0");
    context.fillStyle = backgroundGradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const warmGlow = context.createRadialGradient(240, 240, 40, 240, 240, 340);
    warmGlow.addColorStop(0, "rgba(180, 160, 200, 0.65)");
    warmGlow.addColorStop(1, "rgba(180, 160, 200, 0)");
    context.fillStyle = warmGlow;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const ticketX = 88;
    const ticketY = 168;
    const ticketWidth = 904;
    const ticketHeight = 1588;

    context.fillStyle = "#fcf9ff";
    drawRoundedRect(context, ticketX, ticketY, ticketWidth, ticketHeight, 56);
    context.fill();

    context.save();
    context.strokeStyle = "#d0bddd";
    context.lineWidth = 4;
    context.setLineDash([14, 10]);
    drawRoundedRect(context, ticketX, ticketY, ticketWidth, ticketHeight, 56);
    context.stroke();
    context.restore();

    context.fillStyle = "#ebdff2";
    drawRoundedRect(context, ticketX, ticketY, ticketWidth, 128, 56);
    context.fill();
    context.fillRect(ticketX, ticketY + 74, ticketWidth, 54);

    context.fillStyle = "#3a1c4a";
    context.textAlign = "left";
    context.font = "600 40px Inter, Arial, sans-serif";
    context.fillText("BOARDING PASS", ticketX + 56, ticketY + 84);

    context.textAlign = "center";
    context.fillStyle = "#7a668c";
    context.font = "600 24px Inter, Arial, sans-serif";
    context.fillText("DESTINATION", canvas.width / 2, ticketY + 274);

    context.fillStyle = "#3a1c4a";
    context.font = "600 74px 'Playfair Display', Georgia, serif";
    context.fillText(venueName, canvas.width / 2, ticketY + 366);

    context.fillStyle = "#7a668c";
    context.font = "600 24px Inter, Arial, sans-serif";
    context.fillText(pass.guestName.toUpperCase(), canvas.width / 2, ticketY + 436);

    const dividerY = ticketY + 512;
    context.save();
    context.strokeStyle = "#d0bddd";
    context.lineWidth = 3;
    context.setLineDash([8, 8]);
    context.beginPath();
    context.moveTo(ticketX + 78, dividerY);
    context.lineTo(ticketX + ticketWidth - 78, dividerY);
    context.stroke();
    context.restore();

    const cols = [
      { label: "GUESTS", value: String(pass.attendeesCount), x: ticketX + 144 },
      { label: "SEAT", value: "A01", x: ticketX + 376 },
      { label: "DATE", value: invitationDateLabel, x: ticketX + 606 },
      { label: "ENTRY", value: entryCode, x: ticketX + 836 }
    ];

    cols.forEach(function (column) {
      context.textAlign = "center";
      context.fillStyle = "#7a668c";
      context.font = "600 24px Inter, Arial, sans-serif";
      context.fillText(column.label, column.x, dividerY + 82);
      context.fillStyle = "#3a1c4a";
      context.font = "600 42px 'Playfair Display', Georgia, serif";
      context.fillText(column.value, column.x, dividerY + 156);
    });

    context.fillStyle = "#7a668c";
    context.font = "600 28px Inter, Arial, sans-serif";
    context.fillText("EVENT ENTRY PASS", canvas.width / 2, dividerY + 286);

    const barBaseY = dividerY + 340;
    let currentX = ticketX + 118;
    Array.from({ length: 56 }, function (_, index) {
      return {
        width: index % 5 === 0 ? 8 : index % 2 === 0 ? 5 : 3,
        height: index % 7 === 0 ? 116 : index % 3 === 0 ? 92 : 76
      };
    }).forEach(function (bar) {
      context.fillStyle = "#3a1c4a";
      context.fillRect(currentX, barBaseY, bar.width, bar.height);
      currentX += bar.width + 6;
    });

    context.fillStyle = "#6e5c82";
    context.font = "600 26px Inter, Arial, sans-serif";
    context.fillText(entryCode, canvas.width / 2, barBaseY + 162);

    context.fillStyle = "#3a1c4a";
    context.font = "600 38px 'Playfair Display', Georgia, serif";
    context.fillText("Please present this pass upon arrival", canvas.width / 2, barBaseY + 258);

    function triggerDownload(url) {
      const link = document.createElement("a");
      link.href = url;
      link.download = invitationSlug + "-boarding-pass.png";
      document.body.appendChild(link);
      link.click();
      link.remove();
    }

    if (!canvas.toBlob) {
      triggerDownload(canvas.toDataURL("image/png"));
      return;
    }

    canvas.toBlob(function (blob) {
      if (!blob) {
        triggerDownload(canvas.toDataURL("image/png"));
        return;
      }

      const url = URL.createObjectURL(blob);
      triggerDownload(url);
      setTimeout(function () {
        URL.revokeObjectURL(url);
      }, 1000);
    }, "image/png");
  }

  // دالة الإرسال لـ Formspree 
  async function handleRsvpSubmit(event) {
    event.preventDefault();
    setFeedback(formError, "");
    setFeedback(formSuccess, "");

    const guestNameField = document.getElementById("guestName");
    const messageForCoupleField = document.getElementById("messageForCouple");
    const attendanceField = rsvpForm.querySelector('input[name="الحضور"]:checked');
    const attendeesCount = Number(guestCountInput.value || "1");

    // استخراج القيمة قبل تفريغ الفورم (حل مشكلة الاسم الفارغ)
    const guestNameValue = guestNameField.value.trim();

    if (!guestNameValue) {
      setFeedback(formError, "يرجى كتابة الاسم بالكامل.");
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "جاري الإرسال...";

    const attendanceValue = attendanceField ? attendanceField.value : "نعم، بكل سرور";
    const isAttending = attendanceValue === "نعم، بكل سرور";

    // إعداد البيانات المرسلة لـ Formspree
    const formData = new FormData();
    formData.append("الاسم", guestNameValue);
    formData.append("الحضور", attendanceValue);
    formData.append("عدد الأفراد", attendeesCount);
    if (messageForCoupleField.value.trim()) {
      formData.append("رسالة للعروسين", messageForCoupleField.value.trim());
    }

    const formspreeEndpoint = rsvpForm.getAttribute("action");

    try {
      const response = await fetch(formspreeEndpoint, {
        method: "POST",
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        rsvpForm.reset();
        updateGuestCount(1);
        
        // التحقق مما إذا كان الضيف سيحضر أم لا لإظهار الرد المناسب
        if (isAttending) {
          setFeedback(formSuccess, "شكراً لك. تم تأكيد الحضور، بانتظارك!");
          renderGuestPass({
            guestName: guestNameValue, // إرسال الاسم المحفوظ
            attendeesCount: attendeesCount
          });
        } else {
          // إذا اعتذر الضيف، نظهر له رسالة شكر ونخفي التذكرة
          setFeedback(formSuccess, "شكراً لك. نقدر ظروفك ونتمنى لك التوفيق!");
          if (guestPassWrap) {
            guestPassWrap.hidden = true;
          }
        }
      } else {
        setFeedback(formError, "حدث خطأ أثناء الإرسال. تأكد من إعداد رابط Formspree بشكل صحيح.");
      }
    } catch (error) {
      setFeedback(formError, "حدث خطأ في الاتصال. تأكد من اتصالك بالإنترنت.");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "تأكيد الحضور";
    }
  }

  function bindGuestStepper() {
    document.querySelectorAll("[data-step]").forEach(function (button) {
      button.addEventListener("click", function () {
        const step = Number(button.getAttribute("data-step") || "0");
        const current = Number(guestCountInput.value || "1");
        updateGuestCount(current + step);
      });
    });
  }

  function bindAudioToggle() {
    if (!audioToggle || !backgroundAudio) {
      return;
    }

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
  
  // كود شاشة التحميل
  window.addEventListener("load", function () {
    const loadingScreen = document.getElementById("loadingScreen");
    if (loadingScreen) {
      setTimeout(function () {
        loadingScreen.classList.add("is-hidden");
      }, 500);
    }
  });
})();