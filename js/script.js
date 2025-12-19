document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("hero-canvas");
  const ctx = canvas.getContext("2d");
  const frameCount = 180;
  const fps = 15;
  const frameInterval = 1000 / fps;
  let currentFrame = 0;
  let lastFrameTime = 0;
  const frames = [];
  let framesLoaded = 0;

  for (let i = 1; i <= frameCount; i++) {
    const img = new Image();
    img.src = `assets/frames/frame_${String(i).padStart(3, "0")}.webp`;
    img.onload = () => {
      framesLoaded++;
      if (framesLoaded === 1) {
        canvas.width = img.width;
        canvas.height = img.height;
        drawFrame(0);
      }
    };
    frames.push(img);
  }

  function drawFrame(index) {
    const img = frames[index];
    if (img && img.complete) {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
  }

  function animateFrames(timestamp) {
    if (timestamp - lastFrameTime >= frameInterval) {
      currentFrame = (currentFrame + 1) % frameCount;
      drawFrame(currentFrame);
      lastFrameTime = timestamp;
    }
    requestAnimationFrame(animateFrames);
  }

  requestAnimationFrame(animateFrames);

  const heroSection = document.querySelector(".hero-section");
  const heroTexts = document.querySelectorAll(".hero-text");
  const dots = document.querySelectorAll(".dot");
  const scrollIndicator = document.querySelector(".scroll-indicator");
  const heroTextFlow = document.querySelector(".hero-text-flow");

  const totalSlides = heroTexts.length;
  const clamp01 = (value) => Math.min(Math.max(value, 0), 1);

  function updateHeroByScroll() {
    const heroHeight = heroSection.offsetHeight;
    const viewportHeight = window.innerHeight;
    const scrollableHeight = Math.max(heroHeight - viewportHeight, 1);
    const scrollTop = window.scrollY;
    const progress = clamp01(scrollTop / scrollableHeight);

    const textFlowScrollHeight =
      heroTextFlow.scrollHeight - heroTextFlow.clientHeight;
    heroTextFlow.scrollTop = progress * textFlowScrollHeight;

    const activeDot = Math.min(
      Math.round(progress * (totalSlides - 1)),
      totalSlides - 1
    );
    dots.forEach((dot, i) => dot.classList.toggle("active", i === activeDot));
  }

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      updateHeroByScroll();
      updateVideoByScroll();
      updateNavbarByScroll();
      ticking = false;
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  const featureCards = document.querySelectorAll(".feature-card");

  const observerOptions = {
    threshold: 0.2,
    rootMargin: "0px 0px -50px 0px",
  };

  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add("visible");
        }, index * 100);
      }
    });
  }, observerOptions);

  featureCards.forEach((card) => {
    cardObserver.observe(card);
  });

  const videoContainer = document.querySelector(".video-container");
  const heroSticky = document.querySelector(".hero-sticky");

  const navbar = document.querySelector(".navbar");
  const navContainer = document.querySelector(".nav-container");
  const appSection = document.querySelector(".app-section");

  function updateVideoByScroll() {
    const scrollY = window.scrollY;
    const heroHeight = heroSection.offsetHeight;
    const viewportHeight = window.innerHeight;

    videoContainer.classList.remove("hidden");
    videoContainer.style.transform = "translateY(0px)";

    const opacity = 1 - (scrollY / Math.max(heroHeight, 1)) * 0.5;
    videoContainer.style.opacity = String(Math.max(opacity, 0));

    if (appSection) {
      const navbarHeight = navbar?.offsetHeight ?? 0;
      const appTop = appSection.getBoundingClientRect().top;

      const denom = Math.max(viewportHeight - navbarHeight, 1);
      const progress = clamp01((viewportHeight - appTop) / denom);
      const eased = progress;

      if (heroSticky) {
        const scale = 1 - eased * 0.25;
        heroSticky.style.transform = `scale(${scale})`;
        heroSticky.style.transformOrigin = "center bottom";
      }

      if (navbar) {
        const padYExpanded = 56;
        const padYOriginal = 18;
        const padY = padYExpanded - (padYExpanded - padYOriginal) * eased;
        navbar.style.setProperty("--nav-pad-y", `${padY.toFixed(2)}px`);

        const bgAlphaMax = 0.75;
        const bgAlpha = bgAlphaMax * eased;
        navbar.style.setProperty("--nav-bg-alpha", `${bgAlpha.toFixed(3)}`);
      }

      if (navContainer) {
        const padXExpanded = 72;
        const padXOriginal = 24;
        const padX = padXExpanded - (padXExpanded - padXOriginal) * eased;
        navContainer.style.setProperty("--nav-pad-x", `${padX.toFixed(2)}px`);
      }
    }
  }

  let lastScrolled = false;

  function updateNavbarByScroll() {
    const navbarHeight = navbar.offsetHeight;
    const appSectionTop = appSection.getBoundingClientRect().top;
    const shouldBeScrolled = appSectionTop <= navbarHeight;

    if (shouldBeScrolled !== lastScrolled) {
      lastScrolled = shouldBeScrolled;
      if (shouldBeScrolled) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    }
  }

  const navToggle = document.querySelector(".nav-toggle");
  const navMenus = document.querySelectorAll(".nav-menu");

  navToggle.addEventListener("click", () => {
    navToggle.classList.add("animating");
    navToggle.classList.toggle("active");
    navMenus.forEach((menu) => menu.classList.toggle("active"));
  });

  navToggle.addEventListener("transitionend", () => {
    navToggle.classList.remove("animating");
  });

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      navMenus.forEach((menu) => menu.classList.remove("active"));
      setTimeout(() => {
        navToggle.classList.remove("active");
      }, 300);
    });
  });

  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    question.addEventListener("click", () => {
      faqItems.forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.classList.remove("active");
        }
      });
      item.classList.toggle("active");
    });
  });

  window.addEventListener("load", () => {
    document.body.classList.add("loaded");
  });

  updateHeroByScroll();
  updateVideoByScroll();
  updateNavbarByScroll();
});

document.body.classList.add("loading");
