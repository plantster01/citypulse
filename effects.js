function initCityPulseEffects() {
  const revealTargets = document.querySelectorAll(
    ".metric-band, .insight-strip, .audience-strip, .section-grid, .info-band, .split-section, .feature-grid, .timeline, .roadmap-map, .founder-card"
  );
  const cursorGlow = document.querySelector(".cursor-glow");
  const mapStops = document.querySelectorAll(".map-stop");
  const mapKicker = document.querySelector("#map-detail-kicker");
  const mapTitle = document.querySelector("#map-detail-title");
  const mapBody = document.querySelector("#map-detail-body");
  const mapGoal = document.querySelector("#map-detail-goal");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );

    revealTargets.forEach((target) => {
      target.classList.add("reveal-section");
      observer.observe(target);
    });
  } else {
    revealTargets.forEach((target) => target.classList.add("is-visible"));
  }

  if (cursorGlow && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    window.addEventListener("pointermove", (event) => {
      document.body.classList.add("cursor-active");
      cursorGlow.style.transform = `translate3d(${event.clientX - 130}px, ${event.clientY - 130}px, 0)`;
    });

    window.addEventListener("pointerleave", () => {
      document.body.classList.remove("cursor-active");
    });
  }

  if (mapStops.length && mapKicker && mapTitle && mapBody && mapGoal) {
    const activateStop = (selectedStop) => {
      mapStops.forEach((stop) => {
        const isSelected = stop === selectedStop;
        stop.classList.toggle("is-active", isSelected);
        stop.setAttribute("aria-pressed", String(isSelected));
      });

      mapKicker.textContent = selectedStop.dataset.kicker;
      mapTitle.textContent = selectedStop.dataset.title;
      mapBody.textContent = selectedStop.dataset.body;
      mapGoal.textContent = selectedStop.dataset.goal;
    };

    mapStops.forEach((stop) => {
      stop.addEventListener("click", () => activateStop(stop));
      stop.addEventListener("mouseenter", () => activateStop(stop));
      stop.addEventListener("focus", () => activateStop(stop));
    });
  }
}

initCityPulseEffects();
