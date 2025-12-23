document.addEventListener("DOMContentLoaded", () => {
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
      updateFeatureByScroll();
      ticking = false;
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  const videoContainer = document.querySelector(".video-container");
  const heroSticky = document.querySelector(".hero-sticky");

  const navbar = document.querySelector(".navbar");
  const navContainer = document.querySelector(".nav-container");
  const appSection = document.querySelector(".app-section");

  let cachedIsMobile = window.innerWidth <= 768;
  const isMobile = () => cachedIsMobile;

  const easeOutQuad = (t) => 1 - (1 - t) * (1 - t);

  let lastProgress = -1;
  let lastScale = -1;

  window.addEventListener(
    "resize",
    () => {
      const wasMobile = cachedIsMobile;
      cachedIsMobile = window.innerWidth <= 768;

      if (wasMobile !== cachedIsMobile) {
        lastProgress = -1;
        lastScale = -1;
        heroTextFlow.style.transform = "";
        heroSticky.style.transform = "";
      }
    },
    { passive: true }
  );

  function updateVideoByScroll() {
    const scrollY = window.scrollY;
    const heroHeight = heroSection.offsetHeight;
    const viewportHeight = window.innerHeight;

    const opacity = 1 - (scrollY / Math.max(heroHeight, 1)) * 0.5;
    videoContainer.style.opacity = String(Math.max(opacity, 0));

    if (appSection) {
      const navbarHeight = navbar?.offsetHeight ?? 0;
      const appTop = appSection.getBoundingClientRect().top;

      const denom = Math.max(viewportHeight - navbarHeight, 1);
      const progress = clamp01((viewportHeight - appTop) / denom);

      const progressChanged = Math.abs(progress - lastProgress) > 0.001;
      if (!progressChanged) return;
      lastProgress = progress;

      const eased = progress;

      if (heroSticky) {
        const scale = 1 - eased * 0.25;

        heroSticky.style.transform = `scale(${scale}) translateZ(0)`;
        heroSticky.style.transformOrigin = "center bottom";
        heroTextFlow.style.transform = `scale(${scale}) translateZ(0)`;
        heroTextFlow.style.transformOrigin = "center center";
        lastScale = scale;

        if (isMobile()) {
          const easedRadius = easeOutQuad(eased);
          const maxRadius = 32;
          const radius = easedRadius * maxRadius;
          const maxPadding = 20;
          const padding = easedRadius * maxPadding;

          heroSection.style.padding = `${padding}px`;
          heroSticky.style.top = `${padding}px`;
          heroSticky.style.height = `calc(100vh - ${padding * 2}px)`;
          heroSticky.style.borderRadius = `${radius}px`;
          videoContainer.style.borderRadius = `${radius}px`;
        } else {
          heroSection.style.padding = "20px";
          heroSticky.style.top = "20px";
          heroSticky.style.height = "calc(100vh - 40px)";
          heroSticky.style.borderRadius = "32px";
          videoContainer.style.borderRadius = "32px";
        }
      }

      if (navbar && !isMobile()) {
        const padYExpanded = 56;
        const padYOriginal = 18;
        const padY = padYExpanded - (padYExpanded - padYOriginal) * eased;
        navbar.style.setProperty("--nav-pad-y", `${padY.toFixed(2)}px`);

        const bgAlphaMax = 0.75;
        const bgAlpha = bgAlphaMax * eased;
        navbar.style.setProperty("--nav-bg-alpha", `${bgAlpha.toFixed(3)}`);
      } else if (navbar && isMobile()) {
        navbar.style.setProperty("--nav-pad-y", "18px");
        navbar.style.setProperty(
          "--nav-bg-alpha",
          `${(0.75 * eased).toFixed(3)}`
        );
      }

      if (navContainer && !isMobile()) {
        const padXExpanded = 72;
        const padXOriginal = 24;
        const padX = padXExpanded - (padXExpanded - padXOriginal) * eased;
        navContainer.style.setProperty("--nav-pad-x", `${padX.toFixed(2)}px`);
      } else if (navContainer && isMobile()) {
        navContainer.style.setProperty("--nav-pad-x", "24px");
      }
    }
  }

  const featureScrollContainers = document.querySelectorAll(
    ".feature-scroll-container"
  );

  function updateFeatureByScroll() {
    const viewportHeight = window.innerHeight;

    featureScrollContainers.forEach((container) => {
      const textContent = container.querySelector(".feature-text-content");
      if (!textContent) return;

      const containerRect = container.getBoundingClientRect();
      const containerTop = containerRect.top;

      const scrollProgress = clamp01(-containerTop / (viewportHeight * 0.5));

      const textScale = 1 - scrollProgress * 0.2;
      const textOpacity = 1 - scrollProgress;
      textContent.style.transform = `translate(-50%, -50%) scale(${textScale})`;
      textContent.style.opacity = textOpacity;
    });
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

  const underlineElements = document.querySelectorAll(".underline-animated");
  const underlineObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate");
        } else {
          entry.target.classList.remove("animate");
          void entry.target.offsetWidth;
        }
      });
    },
    { threshold: 0.5 }
  );

  underlineElements.forEach((el) => underlineObserver.observe(el));

  updateHeroByScroll();
  updateVideoByScroll();
  updateNavbarByScroll();
  updateFeatureByScroll();
});

document.body.classList.add("loading");
