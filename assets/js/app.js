const CONFIG = {
  whatsappNumber: "5598991856123",
  baseRate: 480,
  cleaningFee: 0,
  maxGuests: 6,
  longStayDiscountPercent: 0,
  longStayDiscountNights: 7,
  reservedDates: [],
  blockedDates: [],
  // Starter coupon list — add/edit codes and values (R$) as needed.
  discountCodes: {
    BEMVINDO10: 40,
    LENCOIS15: 60
  }
};


const galleryImages = [
  {
    src: "assets/img/quintal-varanda.jpeg",
    title: "Varanda e área externa",
    category: "Área externa",
    alt: "Varanda e área externa arborizada da Casa Barreirinhas",
    width: 1600,
    height: 1200
  },
  {
    src: "assets/img/quarto-arcondicionado.jpeg",
    title: "Quarto climatizado",
    category: "Quarto",
    alt: "Quarto com ar-condicionado e camas na Casa Barreirinhas",
    width: 1600,
    height: 1200
  },
  {
    src: "assets/img/sala.jpeg",
    title: "Sala principal",
    category: "Sala",
    alt: "Sala principal com piso claro e porta para área externa",
    width: 1200,
    height: 1600
  },
  {
    src: "assets/img/sala-jantar.jpeg",
    title: "Sala de jantar",
    category: "Sala",
    alt: "Sala de jantar com mesa e cozinha de apoio",
    width: 1200,
    height: 1600
  },
  {
    src: "assets/img/sala-jantar-2.jpeg",
    title: "Ambiente de refeições",
    category: "Sala",
    alt: "Ambiente de refeições integrado na Casa Barreirinhas",
    width: 1200,
    height: 1600
  },
  {
    src: "assets/img/sala-jantar-3.jpeg",
    title: "Cozinha de apoio",
    category: "Sala",
    alt: "Cozinha de apoio com mesa na Casa Barreirinhas",
    width: 1200,
    height: 1600
  },
  {
    src: "assets/img/quintal.jpeg",
    title: "Quintal",
    category: "Área externa",
    alt: "Quintal amplo da Casa Barreirinhas",
    width: 1200,
    height: 1600
  },
  {
    src: "assets/img/quintal-varanda-2.jpeg",
    title: "Varanda coberta",
    category: "Área externa",
    alt: "Varanda coberta e quintal da Casa Barreirinhas",
    width: 1200,
    height: 1600
  },
  {
    src: "assets/img/entrada-porta-principal.jpeg",
    title: "Entrada principal",
    category: "Fachada",
    alt: "Entrada principal murada da Casa Barreirinhas",
    width: 1200,
    height: 1600
  },
  {
    src: "assets/img/entrada-porta-principal-2.jpeg",
    title: "Acesso da casa",
    category: "Fachada",
    alt: "Acesso externo da Casa Barreirinhas",
    width: 1200,
    height: 1600
  },
  {
    src: "assets/img/entrada-porta-principal-3.jpeg",
    title: "Portão e entrada",
    category: "Fachada",
    alt: "Portão de entrada da Casa Barreirinhas",
    width: 1150,
    height: 1600
  },
  {
    src: "assets/img/frente-da-casa.jpeg",
    title: "Fachada",
    category: "Fachada",
    alt: "Fachada externa da Casa Barreirinhas",
    width: 1600,
    height: 720
  },
  {
    src: "assets/img/banheiro-social.jpeg",
    title: "Banheiro social",
    category: "Banheiros",
    alt: "Banheiro social da Casa Barreirinhas",
    width: 1200,
    height: 1600
  },
  {
    src: "assets/img/banheiro-social-2.jpeg",
    title: "Banheiro completo",
    category: "Banheiros",
    alt: "Banheiro completo com pia e espelho",
    width: 1200,
    height: 1600
  },
  {
    src: "assets/img/banheiro-quarto.jpeg",
    title: "Banheiro do quarto",
    category: "Banheiros",
    alt: "Banheiro do quarto da Casa Barreirinhas",
    width: 1200,
    height: 1600
  }
];

const reservedDates = new Set(CONFIG.reservedDates);
const blockedDates = new Set(CONFIG.blockedDates);
const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const monthFormatter = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });
const shortDateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const state = {
  selectedCheckIn: "",
  selectedCheckOut: "",
  calendarMonth: startOfMonth(new Date()),
  galleryFilter: "Todos",
  lightboxImages: galleryImages,
  lightboxIndex: 0
};

document.addEventListener("DOMContentLoaded", () => {
  setupLoader();
  setupHeader();
  setupHeroSlider();
  setupStayCardGallery();
  setupReveal();
  setupButtons();
  setupScrollSpy();
  setupGallery();
  setupLightbox();
  setupBooking();
  setupCompleteProfileModal();
  setupReviews();
  setupFaq();
  setupFloatingActions();
  setupPaymentPage();
  const currentYear = document.getElementById("currentYear");
  if (currentYear) currentYear.textContent = new Date().getFullYear();
});

function setupLoader() {
  const loader = document.getElementById("loader");
  const loaderButton = loader?.querySelector(".loader__cta");
  const hide = () => {
    if (!loader) return;
    loader.classList.add("is-hidden");
    loader.setAttribute("aria-hidden", "true");
    loaderButton?.blur();
  };

  if (new URLSearchParams(window.location.search).has("skipLoader")) {
    hide();
    return;
  }

  const revealButton = () => loaderButton?.classList.add("is-ready");
  window.addEventListener("load", revealButton, { once: true });
  window.setTimeout(revealButton, 900);
  loaderButton?.addEventListener("click", hide);
  window.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !loader?.classList.contains("is-hidden")) {
      hide();
    }
  }, { once: true });
  window.setTimeout(hide, 2200);
}

function setupHeader() {
  const header = document.getElementById("siteHeader");
  const introSection = document.getElementById("inicio");

  const updateHeader = () => {
    const isPastIntro = introSection
      ? introSection.getBoundingClientRect().bottom <= header.offsetHeight
      : window.scrollY > 18;

    header.classList.toggle("is-scrolled", isPastIntro);
    document.getElementById("backToTop")?.classList.toggle("is-visible", window.scrollY > 700);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
  window.addEventListener("resize", updateHeader);
}

function setupHeroSlider() {
  const DURATION = 3000;
  const HERO_IMAGE_LIMIT = 7;
  const slidesContainer = document.getElementById("heroSlides");
  const dotsContainer = document.getElementById("heroDots");
  if (!slidesContainer || !dotsContainer) return;

  galleryImages.slice(1, HERO_IMAGE_LIMIT).forEach((image) => {
    const img = document.createElement("img");
    img.className = "hero__image";
    img.src = image.src;
    img.alt = "";
    img.width = image.width;
    img.height = image.height;
    img.loading = "lazy";
    img.decoding = "async";
    slidesContainer.appendChild(img);
  });

  const slides = [...slidesContainer.querySelectorAll(".hero__image")];
  if (slides.length < 2) return;

  let index = 0;
  let timer = null;

  const dots = slides.map((_, i) => {
    const dot = document.createElement("button");
    dot.className = "hero-dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Foto ${i + 1} do início`);
    dot.addEventListener("click", () => {
      goTo(i);
      resetTimer();
    });
    dotsContainer.appendChild(dot);
    return dot;
  });

  const updateDots = (active) => {
    dots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === active);
      if (i === active) {
        dot.style.setProperty("--hero-duration", `${DURATION}ms`);
        dot.classList.remove("is-active");
        void dot.offsetWidth;
        dot.classList.add("is-active");
      }
    });
  };

  const goTo = (next) => {
    if (next === index) return;
    slides[index].classList.remove("is-active");
    index = next;
    void slides[index].offsetWidth;
    slides[index].classList.add("is-active");
    updateDots(index);
  };

  const advance = () => {
    goTo((index + 1) % slides.length);
  };

  const resetTimer = () => {
    clearInterval(timer);
    timer = setInterval(advance, DURATION);
  };

  const heroSection = slidesContainer.parentElement;
  const SWIPE_THRESHOLD = 40;
  let pointerId = null;
  let startX = 0;
  let startY = 0;
  let dragging = false;

  const onPointerDown = (event) => {
    if (event.pointerType === "mouse") return;
    pointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    dragging = true;
  };

  const onPointerMove = (event) => {
    if (!dragging || event.pointerId !== pointerId) return;
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      event.preventDefault();
    }
  };

  const endDrag = (event) => {
    if (!dragging || event.pointerId !== pointerId) return;
    dragging = false;
    pointerId = null;
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    if (Math.abs(deltaX) > SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY)) {
      goTo(deltaX < 0 ? (index + 1) % slides.length : (index - 1 + slides.length) % slides.length);
      resetTimer();
    }
  };

  const cancelDrag = () => {
    dragging = false;
    pointerId = null;
  };

  heroSection.addEventListener("pointerdown", onPointerDown, { passive: true });
  heroSection.addEventListener("pointermove", onPointerMove, { passive: false });
  heroSection.addEventListener("pointerup", endDrag, { passive: true });
  heroSection.addEventListener("pointercancel", cancelDrag, { passive: true });

  updateDots(0);
  resetTimer();
}

function setupStayCardGallery() {
  const media = document.getElementById("stayCardMedia");
  const counter = document.getElementById("stayCardCounter");
  if (!media || !counter) return;

  const slides = [...media.querySelectorAll(".stay-card__slide")];
  const prevButton = media.querySelector(".stay-card__nav--prev");
  const nextButton = media.querySelector(".stay-card__nav--next");
  if (slides.length < 2 || !prevButton || !nextButton) return;

  let index = 0;
  const counterLabel = counter.querySelector(".icon").outerHTML;

  const goTo = (next) => {
    slides[index].classList.remove("is-active");
    index = next;
    slides[index].classList.add("is-active");
    counter.innerHTML = `${counterLabel} ${index + 1}/${slides.length}`;
  };

  prevButton.addEventListener("click", () => {
    goTo((index - 1 + slides.length) % slides.length);
  });

  nextButton.addEventListener("click", () => {
    goTo((index + 1) % slides.length);
  });
}

function setupReveal() {
  const elements = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.14 });

  elements.forEach((element) => observer.observe(element));
}

function setupButtons() {
  document.addEventListener("click", (event) => {
    const target = event.target.closest(".button, .icon-button, .filter-button");
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.left = `${event.clientX - rect.left}px`;
    ripple.style.top = `${event.clientY - rect.top}px`;
    target.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
  });
}

function setupScrollSpy() {
  const links = [...document.querySelectorAll(".nav__menu a, .mobile-nav__item")];
  if (!links.length) return;

  const getLinkTarget = (link) => {
    const href = link.getAttribute("href") || "";
    if (!href.includes("#")) return null;
    return href.split("#").pop();
  };

  const setActive = (id) => {
    links.forEach((link) => {
      const href = getLinkTarget(link);
      link.classList.toggle("is-active", id !== null && (href === id || (href === "disponibilidade" && id === "reservar")));
    });
  };

  links.forEach((link) => {
    link.addEventListener("click", () => {
      const targetId = getLinkTarget(link);
      if (targetId) setActive(targetId);
    });
  });
}

function setupGallery() {
  const filterBar = document.getElementById("galleryFilters");
  renderGallery("Todos");

  filterBar?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;
    state.galleryFilter = button.dataset.filter;
    filterBar.querySelectorAll(".filter-button").forEach((filter) => filter.classList.remove("is-active"));
    button.classList.add("is-active");
    renderGallery(state.galleryFilter);
  });
}

function renderGallery(filter) {
  const grid = document.getElementById("galleryGrid");
  if (!grid) return;

  const images = filter === "Todos"
    ? galleryImages
    : galleryImages.filter((image) => image.category === filter);

  state.lightboxImages = images;
  grid.innerHTML = "";

  images.forEach((image, index) => {
    const item = document.createElement("article");
    item.className = "gallery-item reveal is-visible";
    if (index % 7 === 0) item.classList.add("gallery-item--wide");

    const button = document.createElement("button");
    button.type = "button";
    button.className = "gallery-card";
    button.setAttribute("aria-label", `Abrir foto: ${image.title}`);
    button.dataset.index = String(index);
    button.addEventListener("click", (event) => {
      event.preventDefault();
      openLightbox(index);
    });

    const img = document.createElement("img");
    img.src = image.src;
    img.alt = image.alt;
    img.width = image.width;
    img.height = image.height;
    img.loading = index < 2 ? "eager" : "lazy";

    const caption = document.createElement("span");
    caption.className = "gallery-caption";
    caption.innerHTML = `<strong>${escapeHTML(image.title)}</strong><span>${escapeHTML(image.category)}</span>`;

    button.append(img, caption);
    item.appendChild(button);
    grid.appendChild(item);
  });
}

function setupLightbox() {
  const lightbox = document.getElementById("lightbox");
  const closeButtons = lightbox?.querySelectorAll("[data-lightbox-close]");
  const prev = document.getElementById("lightboxPrev");
  const next = document.getElementById("lightboxNext");
  const zoom = document.getElementById("lightboxZoom");
  const imageElement = document.getElementById("lightboxImage");
  if (!lightbox || !imageElement) return;
  let touchStartX = 0;
  let zoomScale = 1;
  let panX = 0;
  let panY = 0;
  let dragState = null;

  const clampZoom = (value, min, max) => Math.min(Math.max(value, min), max);

  const resetLightboxZoom = () => {
    zoomScale = 1;
    panX = 0;
    panY = 0;
    imageElement?.style.setProperty("--zoom-scale", "1");
    imageElement?.style.setProperty("--pan-x", "0px");
    imageElement?.style.setProperty("--pan-y", "0px");
    imageElement?.classList.remove("is-dragging");
  };

  const applyLightboxZoom = (scale, x = 0, y = 0) => {
    zoomScale = scale;
    panX = x;
    panY = y;
    imageElement?.style.setProperty("--zoom-scale", scale.toFixed(2));
    imageElement?.style.setProperty("--pan-x", `${x}px`);
    imageElement?.style.setProperty("--pan-y", `${y}px`);
  };

  const toggleZoom = () => {
    if (!imageElement || !lightbox) return;

    if (lightbox.classList.contains("is-zoomed")) {
      lightbox.classList.remove("is-zoomed");
      resetLightboxZoom();
      return;
    }

    lightbox.classList.add("is-zoomed");
    applyLightboxZoom(1.85);
  };

  closeButtons?.forEach((button) => button.addEventListener("click", closeLightbox));
  prev?.addEventListener("click", () => moveLightbox(-1));
  next?.addEventListener("click", () => moveLightbox(1));
  zoom?.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleZoom();
  });

  imageElement?.addEventListener("click", (event) => {
    if (!lightbox || lightbox.classList.contains("is-zoomed")) return;
    event.preventDefault();
    toggleZoom();
  });

  imageElement?.addEventListener("dblclick", (event) => {
    event.preventDefault();
    toggleZoom();
  });

  lightbox?.addEventListener("wheel", (event) => {
    if (!lightbox.classList.contains("is-zoomed")) {
      lightbox.classList.add("is-zoomed");
    }

    event.preventDefault();
    const delta = event.deltaY < 0 ? 0.15 : -0.15;
    const nextScale = clampZoom(zoomScale + delta, 1, 2.6);

    if (nextScale <= 1) {
      lightbox.classList.remove("is-zoomed");
      resetLightboxZoom();
      return;
    }

    applyLightboxZoom(nextScale, panX, panY);
  }, { passive: false });

  imageElement?.addEventListener("pointerdown", (event) => {
    if (!lightbox?.classList.contains("is-zoomed") || zoomScale <= 1) return;

    dragState = {
      startX: event.clientX,
      startY: event.clientY,
      startPanX: panX,
      startPanY: panY
    };
    imageElement.classList.add("is-dragging");
    imageElement.setPointerCapture(event.pointerId);
  });

  imageElement?.addEventListener("pointermove", (event) => {
    if (!dragState) return;

    const nextPanX = clampZoom(dragState.startPanX + (event.clientX - dragState.startX), -180, 180);
    const nextPanY = clampZoom(dragState.startPanY + (event.clientY - dragState.startY), -140, 140);
    applyLightboxZoom(zoomScale, nextPanX, nextPanY);
  });

  const stopDragging = () => {
    dragState = null;
    imageElement?.classList.remove("is-dragging");
  };

  imageElement?.addEventListener("pointerup", stopDragging);
  imageElement?.addEventListener("pointerleave", stopDragging);
  imageElement?.addEventListener("pointercancel", stopDragging);

  lightbox?.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });

  lightbox?.addEventListener("touchend", (event) => {
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) < 42) return;
    moveLightbox(distance > 0 ? -1 : 1);
  }, { passive: true });

  document.addEventListener("keydown", (event) => {
    if (lightbox?.hasAttribute("hidden")) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") moveLightbox(-1);
    if (event.key === "ArrowRight") moveLightbox(1);
  });
}

function openLightbox(index) {
  const safeIndex = Number.isInteger(index) ? index : 0;
  state.lightboxIndex = safeIndex;
  const lightbox = document.getElementById("lightbox");
  const imageElement = document.getElementById("lightboxImage");
  lightbox.hidden = false;
  lightbox.classList.remove("is-zoomed");
  imageElement?.classList.remove("is-dragging");
  imageElement?.style.setProperty("--zoom-scale", "1");
  imageElement?.style.setProperty("--pan-x", "0px");
  imageElement?.style.setProperty("--pan-y", "0px");
  document.body.style.overflow = "hidden";
  updateLightbox();
  document.querySelector(".lightbox__close")?.focus();
}

function closeLightbox() {
  const lightbox = document.getElementById("lightbox");
  const imageElement = document.getElementById("lightboxImage");
  lightbox.classList.remove("is-zoomed");
  imageElement?.classList.remove("is-dragging");
  imageElement?.style.setProperty("--zoom-scale", "1");
  imageElement?.style.setProperty("--pan-x", "0px");
  imageElement?.style.setProperty("--pan-y", "0px");
  lightbox.hidden = true;
  document.body.style.overflow = "";
}

function moveLightbox(direction) {
  const length = state.lightboxImages.length;
  state.lightboxIndex = (state.lightboxIndex + direction + length) % length;
  document.getElementById("lightbox")?.classList.remove("is-zoomed");
  const imageElement = document.getElementById("lightboxImage");
  imageElement?.classList.remove("is-dragging");
  imageElement?.style.setProperty("--zoom-scale", "1");
  imageElement?.style.setProperty("--pan-x", "0px");
  imageElement?.style.setProperty("--pan-y", "0px");
  updateLightbox();
}

function updateLightbox() {
  const image = state.lightboxImages[state.lightboxIndex];
  const img = document.getElementById("lightboxImage");
  const caption = document.getElementById("lightboxCaption");
  const counter = document.getElementById("lightboxCounter");
  if (!image || !img || !caption || !counter) return;

  img.classList.add("is-switching");
  img.src = image.src;
  img.alt = image.alt;
  caption.textContent = image.title;
  counter.textContent = `Imagem ${state.lightboxIndex + 1} de ${state.lightboxImages.length}`;
  requestAnimationFrame(() => {
    img.classList.remove("is-switching");
  });
}

function getStoredProfile() {
  try {
    return JSON.parse(localStorage.getItem("userProfile") || "null");
  } catch {
    return null;
  }
}

function isProfileComplete(profile) {
  return Boolean(profile && profile.name && profile.phone && profile.cpf);
}

function showCompleteProfileModal() {
  document.getElementById("completeProfileModal")?.removeAttribute("hidden");
}

function hideCompleteProfileModal() {
  document.getElementById("completeProfileModal")?.setAttribute("hidden", "");
}

function setupCompleteProfileModal() {
  const modal = document.getElementById("completeProfileModal");
  if (!modal) return;

  modal.querySelectorAll("[data-confirm-close]").forEach((el) => el.addEventListener("click", hideCompleteProfileModal));

  document.getElementById("completeProfileConfirm")?.addEventListener("click", () => {
    hideCompleteProfileModal();
    document.getElementById("accountButton")?.click();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) hideCompleteProfileModal();
  });
}

function setupBooking() {
  const todayISO = toISO(startOfDay(new Date()));
  const checkInInput = document.getElementById("checkInInput");
  const checkOutInput = document.getElementById("checkOutInput");
  const guestInput = document.getElementById("guestInput");
  const discountInput = document.getElementById("discountInput");
  const form = document.getElementById("reservationForm");
  if (!checkInInput || !checkOutInput || !guestInput || !form) return;

  const bookingSection = document.getElementById("disponibilidade");
  const bookingChoice = document.getElementById("reservar");
  const bookingPanel = document.getElementById("bookingPanel");
  const openBookingPanel = document.getElementById("openBookingPanel");
  const closeBookingPanel = document.getElementById("closeBookingPanel");
  const siteHeader = document.getElementById("siteHeader");
  let headerWasScrolled = false;

  const onPanelKeydown = (event) => {
    if (event.key === "Escape") hideBookingPanel();
  };

  const showBookingPanel = () => {
    if (!bookingPanel) return;

    bookingPanel.hidden = false;
    bookingPanel.scrollTop = 0;
    bookingChoice?.setAttribute("hidden", "");
    bookingSection?.classList.add("is-booking-open");
    document.body.classList.add("booking-open");
    headerWasScrolled = siteHeader?.classList.contains("is-scrolled") ?? false;
    siteHeader?.classList.add("is-scrolled");
    document.addEventListener("keydown", onPanelKeydown);
    requestAnimationFrame(renderCalendar);
    window.setTimeout(() => checkInInput.focus({ preventScroll: true }), 120);
  };

  const hideBookingPanel = () => {
    if (!bookingPanel) return;

    bookingPanel.hidden = true;
    bookingChoice?.removeAttribute("hidden");
    bookingSection?.classList.remove("is-booking-open");
    document.body.classList.remove("booking-open");
    if (!headerWasScrolled) siteHeader?.classList.remove("is-scrolled");
    document.removeEventListener("keydown", onPanelKeydown);
    openBookingPanel?.focus({ preventScroll: true });
  };

  openBookingPanel?.addEventListener("click", () => {
    if (!isProfileComplete(getStoredProfile())) {
      showCompleteProfileModal();
      return;
    }
    showBookingPanel();
  });
  closeBookingPanel?.addEventListener("click", hideBookingPanel);

  checkInInput.min = todayISO;
  checkOutInput.min = todayISO;
  guestInput.max = CONFIG.maxGuests;

  checkInInput.addEventListener("change", () => {
    if (!isSelectable(checkInInput.value)) {
      state.selectedCheckIn = "";
      checkInInput.value = "";
      setBookingStatus("Escolha uma data de entrada disponível.", "error");
      updateBookingSummary();
      renderCalendar();
      return;
    }

    state.selectedCheckIn = checkInInput.value;
    if (state.selectedCheckOut && compareISO(state.selectedCheckOut, state.selectedCheckIn) <= 0) {
      state.selectedCheckOut = "";
      checkOutInput.value = "";
    }
    checkOutInput.min = addDaysISO(state.selectedCheckIn, 1);
    updateBookingSummary();
    renderCalendar();
  });

  checkOutInput.addEventListener("change", () => {
    if (!state.selectedCheckIn) {
      setBookingStatus("Selecione a entrada antes da saída.", "error");
      checkOutInput.value = "";
      return;
    }

    if (!isSelectable(checkOutInput.value) || compareISO(checkOutInput.value, state.selectedCheckIn) <= 0) {
      state.selectedCheckOut = "";
      checkOutInput.value = "";
      setBookingStatus("Escolha uma data de saída posterior à entrada.", "error");
      updateBookingSummary();
      renderCalendar();
      return;
    }

    if (rangeHasUnavailable(state.selectedCheckIn, checkOutInput.value)) {
      state.selectedCheckOut = "";
      checkOutInput.value = "";
      setBookingStatus("Há uma data indisponível dentro do período.", "error");
      updateBookingSummary();
      renderCalendar();
      return;
    }

    state.selectedCheckOut = checkOutInput.value;
    updateBookingSummary();
    renderCalendar();
  });

  guestInput.addEventListener("input", () => {
    const value = clamp(Number(guestInput.value || 1), 1, CONFIG.maxGuests);
    guestInput.value = value;
    updateBookingSummary();
  });

  discountInput?.addEventListener("input", () => {
    const cursor = discountInput.selectionStart;
    discountInput.value = discountInput.value.toUpperCase();
    discountInput.setSelectionRange(cursor, cursor);
    updateDiscountHint();
    updateBookingSummary();
  });

  document.getElementById("prevMonth")?.addEventListener("click", () => {
    const currentMonth = startOfMonth(new Date());
    const previous = new Date(state.calendarMonth.getFullYear(), state.calendarMonth.getMonth() - 1, 1);
    if (previous < currentMonth) return;
    state.calendarMonth = previous;
    renderCalendar();
  });

  document.getElementById("nextMonth")?.addEventListener("click", () => {
    state.calendarMonth = new Date(state.calendarMonth.getFullYear(), state.calendarMonth.getMonth() + 1, 1);
    renderCalendar();
  });

  if (document.getElementById("calendar")) {
    window.addEventListener("resize", debounce(renderCalendar, 180));
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    submitReservation(form);
  });

  renderCalendar();
  updateBookingSummary();
}

function renderCalendar() {
  const calendar = document.getElementById("calendar");
  if (!calendar) return;

  const monthCount = window.matchMedia("(min-width: 760px)").matches ? 2 : 1;
  const months = Array.from({ length: monthCount }, (_, index) => {
    return new Date(state.calendarMonth.getFullYear(), state.calendarMonth.getMonth() + index, 1);
  });

  document.getElementById("calendarTitle").textContent = monthCount === 1
    ? capitalize(monthFormatter.format(months[0]))
    : `${capitalize(monthFormatter.format(months[0]))} - ${capitalize(monthFormatter.format(months[1]))}`;

  calendar.innerHTML = "";
  months.forEach((month) => calendar.appendChild(renderMonth(month)));
}

function renderMonth(monthDate) {
  const wrapper = document.createElement("section");
  wrapper.className = "calendar-month";

  const title = document.createElement("h4");
  title.textContent = capitalize(monthFormatter.format(monthDate));

  const grid = document.createElement("div");
  grid.className = "calendar-grid";

  weekDays.forEach((day) => {
    const weekday = document.createElement("div");
    weekday.className = "weekday";
    weekday.textContent = day;
    grid.appendChild(weekday);
  });

  const firstDayIndex = monthDate.getDay();
  for (let i = 0; i < firstDayIndex; i += 1) {
    const spacer = document.createElement("span");
    spacer.className = "calendar-empty";
    grid.appendChild(spacer);
  }

  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
    const iso = toISO(date);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "day";
    button.textContent = day;
    button.dataset.date = iso;
    button.setAttribute("aria-label", shortDateFormatter.format(date));

    const unavailable = !isSelectable(iso);
    if (reservedDates.has(iso)) button.classList.add("is-reserved");
    if (blockedDates.has(iso)) button.classList.add("is-blocked");
    if (isSameDay(date, new Date())) button.classList.add("is-today");
    if (iso === state.selectedCheckIn || iso === state.selectedCheckOut) button.classList.add("is-selected");
    if (isDateInRange(iso)) button.classList.add("is-range");

    button.disabled = unavailable;
    button.addEventListener("click", () => selectCalendarDate(iso));
    grid.appendChild(button);
  }

  wrapper.append(title, grid);
  return wrapper;
}

function selectCalendarDate(iso) {
  if (!isSelectable(iso)) return;

  if (!state.selectedCheckIn || state.selectedCheckOut || compareISO(iso, state.selectedCheckIn) <= 0) {
    state.selectedCheckIn = iso;
    state.selectedCheckOut = "";
    setBookingStatus("Entrada selecionada. Escolha a saída.", "");
  } else if (rangeHasUnavailable(state.selectedCheckIn, iso)) {
    setBookingStatus("Há uma data indisponível dentro do período.", "error");
  } else {
    state.selectedCheckOut = iso;
    setBookingStatus("Período selecionado. Preencha os dados para solicitar.", "success");
  }

  document.getElementById("checkInInput").value = state.selectedCheckIn;
  document.getElementById("checkOutInput").value = state.selectedCheckOut;
  document.getElementById("checkOutInput").min = state.selectedCheckIn ? addDaysISO(state.selectedCheckIn, 1) : toISO(new Date());
  updateBookingSummary();
  renderCalendar();
}

function updateBookingSummary() {
  const guests = clamp(Number(document.getElementById("guestInput").value || 1), 1, CONFIG.maxGuests);
  const nights = getSelectedNights();
  const subtotal = nights * CONFIG.baseRate;
  const discount = getSelectedDiscount(subtotal, nights);
  const total = Math.max(0, subtotal + CONFIG.cleaningFee - discount);

  document.getElementById("summaryCheckIn").textContent = state.selectedCheckIn ? formatISO(state.selectedCheckIn) : "Selecione";
  document.getElementById("summaryCheckOut").textContent = state.selectedCheckOut ? formatISO(state.selectedCheckOut) : "Selecione";
  document.getElementById("summaryNights").textContent = String(nights);
  document.getElementById("summaryGuests").textContent = String(guests);
  document.getElementById("summaryRate").textContent = money.format(CONFIG.baseRate);
  document.getElementById("summaryCleaning").textContent = CONFIG.cleaningFee > 0 ? money.format(CONFIG.cleaningFee) : "Inclusa";
  document.getElementById("summaryDiscount").textContent = money.format(discount);
  document.getElementById("summaryTotal").textContent = money.format(total);
  updateWhatsAppFloat();
}

function submitReservation(form) {
  const status = document.getElementById("formStatus");
  status.className = "form-status";

  if (!state.selectedCheckIn || !state.selectedCheckOut || getSelectedNights() < 1) {
    setFormStatus("Selecione entrada e saída antes de solicitar a reserva.", "error");
    document.getElementById("disponibilidade").scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  if (!form.checkValidity()) {
    setFormStatus("Complete os campos obrigatórios para continuar.", "error");
    form.reportValidity();
    return;
  }

  const profile = getStoredProfile();
  if (!isProfileComplete(profile)) {
    showCompleteProfileModal();
    return;
  }

  const guests = clamp(Number(document.getElementById("guestInput").value || 1), 1, CONFIG.maxGuests);
  const nights = getSelectedNights();
  const subtotal = nights * CONFIG.baseRate;
  const discount = getSelectedDiscount(subtotal, nights);
  const discountCode = getDiscountCode();
  const total = getSelectedTotal();
  const data = {
    name: profile.name || "",
    phone: profile.phone || "",
    cpf: (profile.cpf || "").replace(/\D/g, ""),
    email: profile.email || "",
    city: profile.city || "",
    state: (profile.state || "").toUpperCase(),
    notes: document.getElementById("notesInput").value.trim()
  };

  const message = [
    "Olá! Gostaria de reservar o Entre Dunas Chalé.",
    "",
    `Nome: ${data.name}`,
    `Telefone: ${data.phone}`,
    `Email: ${data.email}`,
    ...(data.city || data.state ? [`Cidade/Estado: ${data.city}${data.city && data.state ? " - " : ""}${data.state}`] : []),
    `Entrada: ${formatISO(state.selectedCheckIn)}`,
    `Saída: ${formatISO(state.selectedCheckOut)}`,
    `Número de hóspedes: ${guests}`,
    `Quantidade de noites: ${nights}`,
    `Desconto: ${discount > 0 ? money.format(discount) : "Nenhum"}${discountCode && CONFIG.discountCodes[discountCode] ? ` (cupom ${discountCode})` : ""}`,
    `Valor estimado: ${money.format(total)}`,
    `Observações: ${data.notes || "Nenhuma"}`,
    "",
    "Aguardo confirmação de disponibilidade e forma de pagamento."
  ].join("\n");

  const payload = {
    house: "Entre Dunas Chalé",
    checkInISO: state.selectedCheckIn,
    checkOutISO: state.selectedCheckOut,
    checkIn: formatISO(state.selectedCheckIn),
    checkOut: formatISO(state.selectedCheckOut),
    nights,
    guests,
    rate: CONFIG.baseRate,
    cleaning: CONFIG.cleaningFee,
    discount,
    discountCode: discount > 0 && CONFIG.discountCodes[discountCode] ? discountCode : "",
    subtotal,
    total,
    name: data.name,
    phone: data.phone,
    cpf: data.cpf,
    email: data.email,
    city: data.city,
    state: data.state,
    notes: data.notes,
    whatsappMessage: message
  };

  sessionStorage.setItem("reservationPayload", JSON.stringify(payload));
  window.location.href = "pagamento.html";
}

function updateWhatsAppFloat() {
  const float = document.getElementById("whatsappFloat");
  if (!float) return;

  const nights = getSelectedNights();
  const message = [
    "Olá! Gostaria de informações sobre a Casa Barreirinhas.",
    state.selectedCheckIn ? `Entrada: ${formatISO(state.selectedCheckIn)}` : "",
    state.selectedCheckOut ? `Saída: ${formatISO(state.selectedCheckOut)}` : "",
    nights ? `Noites: ${nights}` : "",
    nights ? `Valor estimado: ${money.format(getSelectedTotal())}` : ""
  ].filter(Boolean).join("\n");

  float.href = getWhatsAppUrl(message);
}

function setupReviews() {
  const DURATION = 5200;
  const slider = document.getElementById("reviewSlider");
  const cards = [...document.querySelectorAll(".review-card")];
  const dotsContainer = document.getElementById("reviewDots");
  const prevButton = document.getElementById("reviewPrev");
  const nextButton = document.getElementById("reviewNext");
  if (!slider || cards.length < 2) return;

  let index = 0;
  let timer = null;
  let isSyncingScroll = false;

  const dots = cards.map((_, i) => {
    const dot = document.createElement("button");
    dot.className = "review-dot";
    dot.setAttribute("aria-label", `Avaliação ${i + 1}`);
    dot.addEventListener("click", () => { goTo(i); resetTimer(); });
    dotsContainer?.appendChild(dot);
    return dot;
  });

  const updateDots = (active) => {
    dots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === active);
      if (i === active) {
        dot.style.setProperty("--review-duration", `${DURATION}ms`);
        dot.classList.remove("is-active");
        void dot.offsetWidth;
        dot.classList.add("is-active");
      }
    });
  };

  const updateArrows = (active) => {
    if (prevButton) prevButton.disabled = active === 0;
    if (nextButton) nextButton.disabled = active === cards.length - 1;
  };

  const goTo = (next) => {
    index = Math.max(0, Math.min(next, cards.length - 1));
    isSyncingScroll = true;
    slider.scrollTo({ left: cards[index].offsetLeft - slider.offsetLeft, behavior: "smooth" });
    updateDots(index);
    updateArrows(index);
    window.clearTimeout(goTo.releaseTimer);
    goTo.releaseTimer = window.setTimeout(() => { isSyncingScroll = false; }, 600);
  };

  const advance = () => goTo((index + 1) % cards.length);

  const resetTimer = () => {
    clearInterval(timer);
    timer = setInterval(advance, DURATION);
  };

  prevButton?.addEventListener("click", () => { goTo(index - 1); resetTimer(); });
  nextButton?.addEventListener("click", () => { goTo(index + 1); resetTimer(); });

  const observer = new IntersectionObserver((entries) => {
    if (isSyncingScroll) return;
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const next = cards.indexOf(visible.target);
    if (next === -1 || next === index) return;
    index = next;
    updateDots(index);
    updateArrows(index);
  }, { root: slider, threshold: [0.6] });
  cards.forEach((card) => observer.observe(card));

  slider.addEventListener("pointerdown", () => clearInterval(timer));
  slider.addEventListener("pointerup", resetTimer);
  slider.addEventListener("mouseenter", () => clearInterval(timer));
  slider.addEventListener("mouseleave", resetTimer);

  updateDots(0);
  updateArrows(0);
  resetTimer();
}

function setupFaq() {
  const accordion = document.getElementById("faqAccordion");
  accordion?.addEventListener("toggle", (event) => {
    if (event.target.tagName !== "DETAILS" || !event.target.open) return;
    accordion.querySelectorAll("details").forEach((details) => {
      if (details !== event.target) details.open = false;
    });
  }, true);
}

function setupFloatingActions() {
  document.getElementById("backToTop")?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  updateWhatsAppFloat();
}

function setupPaymentPage() {
  const page = document.getElementById("paymentPage");
  if (!page) return;

  const emptyState = document.getElementById("paymentEmpty");
  const content = document.getElementById("paymentContent");
  const raw = sessionStorage.getItem("reservationPayload");
  const payload = raw ? JSON.parse(raw) : null;

  if (!payload) {
    if (emptyState) emptyState.hidden = false;
    if (content) content.hidden = true;
    return;
  }

  if (emptyState) emptyState.hidden = true;
  if (content) content.hidden = false;

  document.getElementById("payGuestName").textContent = payload.name;
  document.getElementById("payCheckIn").textContent = payload.checkIn;
  document.getElementById("payCheckOut").textContent = payload.checkOut;
  document.getElementById("payNights").textContent = String(payload.nights);
  document.getElementById("payGuests").textContent = String(payload.guests);
  document.getElementById("payRate").textContent = money.format(payload.rate);
  document.getElementById("payCleaning").textContent = payload.cleaning > 0 ? money.format(payload.cleaning) : "Inclusa";

  const discountRow = document.getElementById("payDiscountRow");
  if (discountRow) {
    discountRow.hidden = payload.discount <= 0;
    if (payload.discount > 0) {
      document.getElementById("payDiscount").textContent = `-${money.format(payload.discount)}${payload.discountCode ? ` (${payload.discountCode})` : ""}`;
    }
  }

  document.getElementById("payTotal").textContent = money.format(payload.total);

  const statusParam = new URLSearchParams(window.location.search).get("status");
  if (statusParam === "success") {
    showPaymentStatus("Pagamento aprovado! Você vai receber a confirmação por e-mail e pelo WhatsApp em breve.", "success");
  } else if (statusParam === "pending") {
    showPaymentStatus("Pagamento em processamento. Assim que for aprovado, você recebe a confirmação.", "pending");
  } else if (statusParam === "failure") {
    showPaymentStatus("O pagamento não foi concluído. Você pode tentar novamente ou combinar pelo WhatsApp.", "error");
  }

  let selectedPaymentMethod = null;
  const methodButtons = Array.from(document.querySelectorAll(".payment-method-option"));
  const methodHint = document.getElementById("paymentMethodHint");
  methodButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedPaymentMethod = btn.dataset.method;
      methodButtons.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      if (methodHint) methodHint.textContent = "";
    });
  });

  const payNowButton = document.getElementById("payNow");
  payNowButton?.addEventListener("click", async () => {
    if (!selectedPaymentMethod) {
      if (methodHint) methodHint.textContent = "Escolha Pix ou cartão pra continuar.";
      return;
    }

    const label = payNowButton.querySelector("span");
    const originalLabel = label?.textContent;
    payNowButton.disabled = true;
    if (label) label.textContent = "Processando...";

    try {
      const response = await fetch("/.netlify/functions/create-payment-asaas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkInISO: payload.checkInISO,
          checkOutISO: payload.checkOutISO,
          guests: payload.guests,
          discountCode: payload.discountCode,
          name: payload.name,
          phone: payload.phone,
          email: payload.email,
          cpf: payload.cpf,
          paymentMethod: selectedPaymentMethod
        })
      });

      if (!response.ok) throw new Error("payment request failed");

      const data = await response.json();
      if (!data.checkoutUrl) throw new Error("missing checkout url");

      window.location.href = data.checkoutUrl;
    } catch (error) {
      console.error("create-payment error:", error);
      showPaymentStatus("Não foi possível iniciar o pagamento agora. Tente novamente ou fale pelo WhatsApp.", "error");
      payNowButton.disabled = false;
      if (label && originalLabel) label.textContent = originalLabel;
    }
  });

  document.getElementById("confirmWhatsApp")?.addEventListener("click", () => {
    window.open(getWhatsAppUrl(payload.whatsappMessage), "_blank", "noopener");
  });
}

function showPaymentStatus(message, type) {
  const status = document.getElementById("paymentStatus");
  if (!status) return;
  status.textContent = message;
  status.className = `payment-status is-${type}`;
  status.hidden = false;
}

function getWhatsAppUrl(message) {
  const encoded = encodeURIComponent(message);
  const phone = CONFIG.whatsappNumber.replace(/\D/g, "");
  return phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
}

function setBookingStatus(message, type) {
  const note = document.getElementById("bookingNote");
  note.textContent = message || "Datas e valores são confirmados diretamente com o anfitrião.";
  note.classList.toggle("is-error", type === "error");
  note.classList.toggle("is-success", type === "success");
}

function setFormStatus(message, type) {
  const status = document.getElementById("formStatus");
  status.textContent = message;
  status.className = `form-status is-${type}`;
}

function getSelectedNights() {
  if (!state.selectedCheckIn || !state.selectedCheckOut) return 0;
  return Math.max(0, diffDays(state.selectedCheckIn, state.selectedCheckOut));
}

function getSelectedTotal() {
  const nights = getSelectedNights();
  const subtotal = nights * CONFIG.baseRate;
  const discount = getSelectedDiscount(subtotal, nights);
  return Math.max(0, subtotal + CONFIG.cleaningFee - discount);
}

function getSelectedDiscount(subtotal, nights = getSelectedNights()) {
  const automaticDiscount = nights >= CONFIG.longStayDiscountNights
    ? Math.round(subtotal * CONFIG.longStayDiscountPercent)
    : 0;
  const codeDiscount = CONFIG.discountCodes[getDiscountCode()] || 0;
  return clamp(Math.max(automaticDiscount, codeDiscount), 0, Math.max(0, subtotal + CONFIG.cleaningFee));
}

function getDiscountCode() {
  const input = document.getElementById("discountInput");
  return String(input?.value || "").trim().toUpperCase();
}

function updateDiscountHint() {
  const hint = document.getElementById("discountHint");
  if (!hint) return;

  const code = getDiscountCode();
  if (!code) {
    hint.textContent = "";
    hint.className = "field-hint";
    return;
  }

  const value = CONFIG.discountCodes[code];
  if (value) {
    hint.textContent = `Cupom aplicado: -${money.format(value)}`;
    hint.className = "field-hint is-success";
  } else {
    hint.textContent = "Código não reconhecido.";
    hint.className = "field-hint is-error";
  }
}


function isSelectable(iso) {
  if (!iso) return false;
  const date = fromISO(iso);
  const today = startOfDay(new Date());
  return date >= today && !reservedDates.has(iso) && !blockedDates.has(iso);
}

function rangeHasUnavailable(startISO, endISO) {
  let cursor = addDays(fromISO(startISO), 1);
  const end = fromISO(endISO);
  while (cursor <= end) {
    if (!isSelectable(toISO(cursor))) return true;
    cursor = addDays(cursor, 1);
  }
  return false;
}

function isDateInRange(iso) {
  if (!state.selectedCheckIn || !state.selectedCheckOut) return false;
  return compareISO(iso, state.selectedCheckIn) > 0 && compareISO(iso, state.selectedCheckOut) < 0;
}

function formatISO(iso) {
  return shortDateFormatter.format(fromISO(iso)).replace(".", "");
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function fromISO(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function addDaysISO(iso, amount) {
  return toISO(addDays(fromISO(iso), amount));
}

function diffDays(startISO, endISO) {
  const start = fromISO(startISO);
  const end = fromISO(endISO);
  return Math.round((end - start) / 86400000);
}

function compareISO(a, b) {
  return fromISO(a) - fromISO(b);
}

function isSameDay(a, b) {
  return toISO(a) === toISO(b);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function debounce(callback, delay) {
  let timer;
  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => callback(...args), delay);
  };
}

function escapeHTML(value) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#039;"
    };
    return entities[character];
  });
}
