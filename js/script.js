document.addEventListener("DOMContentLoaded", () => {
  const heroSection = document.querySelector(".hero-section");
  const heroTexts = document.querySelectorAll(".hero-text");
  const dots = document.querySelectorAll(".dot");
  const scrollIndicator = document.querySelector(".scroll-indicator");
  const heroTextFlow = document.querySelector(".hero-text-flow");

  const totalSlides = heroTexts.length;
  const clamp01 = (value) => Math.min(Math.max(value, 0), 1);

  let isLowPowerMode = false;
  let frameSkipCounter = 0;
  const FRAME_SKIP_THRESHOLD = 2;

  if ("getBattery" in navigator) {
    navigator.getBattery().then((battery) => {
      const checkLowPower = () => {
        isLowPowerMode = battery.level <= 0.2 && !battery.charging;
      };
      checkLowPower();
      battery.addEventListener("levelchange", checkLowPower);
      battery.addEventListener("chargingchange", checkLowPower);
    });
  }

  const detectReducedMotion = () => {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  };

  const pendingStyles = new Map();
  let styleFlushScheduled = false;

  const setOptimizedStyle = (element, property, value) => {
    if (!pendingStyles.has(element)) {
      pendingStyles.set(element, {});
    }
    pendingStyles.get(element)[property] = value;

    if (!styleFlushScheduled) {
      styleFlushScheduled = true;
      requestAnimationFrame(flushStyles);
    }
  };

  const flushStyles = () => {
    pendingStyles.forEach((styles, element) => {
      Object.assign(element.style, styles);
    });
    pendingStyles.clear();
    styleFlushScheduled = false;
  };

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
  let lastScrollY = -1;

  const onScroll = () => {
    if (ticking) return;

    if (isLowPowerMode) {
      frameSkipCounter++;
      if (frameSkipCounter < FRAME_SKIP_THRESHOLD) return;
      frameSkipCounter = 0;
    }

    const currentScrollY = window.scrollY;
    if (Math.abs(currentScrollY - lastScrollY) < 1) return;
    lastScrollY = currentScrollY;

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
  window.addEventListener(
    "resize",
    () => {
      lastScrollY = -1;
      onScroll();
    },
    { passive: true }
  );

  const videoContainer = document.querySelector(".video-container");
  const heroSticky = document.querySelector(".hero-sticky");

  const navbar = document.querySelector(".navbar");
  const navContainer = document.querySelector(".nav-container");
  const appSection = document.querySelector(".app-section");
  const featureScrollContainers = document.querySelectorAll(
    ".feature-scroll-container"
  );

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
        heroTextFlow.style.webkitTransform = "";
        heroSticky.style.transform = "";
        heroSticky.style.webkitTransform = "";

        if (cachedIsMobile) {
          heroSection.style.padding = "0";
          heroSticky.style.top = "0";
          heroSticky.style.height = "100vh";
          heroSticky.style.borderRadius = "0";
          videoContainer.style.borderRadius = "0";
          navbar.style.setProperty("--nav-pad-y", "18px");
          navContainer.style.setProperty("--nav-pad-x", "24px");
        } else {
          heroSection.style.padding = "20px";
          heroSticky.style.top = "20px";
          heroSticky.style.height = "calc(100vh - 40px)";
          heroSticky.style.borderRadius = "32px";
          videoContainer.style.borderRadius = "32px";
          navbar.style.setProperty("--nav-pad-y", "56px");
          navbar.style.setProperty("--nav-bg-alpha", "0");
          navContainer.style.setProperty("--nav-pad-x", "72px");
        }

        featureScrollContainers.forEach((container) => {
          const textContent = container.querySelector(".feature-text-content");
          if (textContent) {
            textContent.style.transform = "";
            textContent.style.webkitTransform = "";
            textContent.style.opacity = "";
          }
        });

        layoutCacheValid = false;
        requestAnimationFrame(() => {
          updateHeroByScroll();
          updateVideoByScroll();
          updateNavbarByScroll();
          updateFeatureByScroll();
        });
      }
    },
    { passive: true }
  );

  let cachedHeroHeight = 0;
  let cachedViewportHeight = 0;
  let cachedNavbarHeight = 0;
  let layoutCacheValid = false;

  const updateLayoutCache = () => {
    cachedHeroHeight = heroSection.offsetHeight;
    cachedViewportHeight = window.innerHeight;
    cachedNavbarHeight = navbar?.offsetHeight ?? 0;
    layoutCacheValid = true;
  };

  window.addEventListener(
    "resize",
    () => {
      layoutCacheValid = false;
    },
    { passive: true }
  );

  function updateVideoByScroll() {
    const scrollY = window.scrollY;

    if (!layoutCacheValid) updateLayoutCache();
    const heroHeight = cachedHeroHeight;
    const viewportHeight = cachedViewportHeight;

    const opacity = 1 - (scrollY / Math.max(heroHeight, 1)) * 0.5;
    const clampedOpacity = Math.max(opacity, 0);

    const currentOpacity = parseFloat(videoContainer.style.opacity) || 1;
    if (Math.abs(clampedOpacity - currentOpacity) > 0.01) {
      videoContainer.style.opacity = clampedOpacity.toFixed(2);
    }

    if (appSection) {
      const appTop = appSection.getBoundingClientRect().top;

      const denom = Math.max(viewportHeight - cachedNavbarHeight, 1);
      const progress = clamp01((viewportHeight - appTop) / denom);

      const progressChanged = Math.abs(progress - lastProgress) > 0.005;
      if (!progressChanged) return;
      lastProgress = progress;

      const eased = progress;

      if (heroSticky) {
        const scale = 1 - eased * 0.25;

        if (Math.abs(scale - lastScale) > 0.002) {
          const scaleStr = scale.toFixed(4);
          const stickyTransform = `scale(${scaleStr}) translateZ(0)`;
          heroSticky.style.transform = stickyTransform;
          heroSticky.style.webkitTransform = stickyTransform;

          const flowTransform = `scale(${scaleStr}) translateZ(0)`;
          heroTextFlow.style.transform = flowTransform;
          heroTextFlow.style.webkitTransform = flowTransform;
          lastScale = scale;
        }

        if (isMobile()) {
          const easedRadius = easeOutQuad(eased);
          const maxRadius = 32;
          const radius = Math.round(easedRadius * maxRadius);
          const maxPadding = 20;
          const padding = Math.round(easedRadius * maxPadding);

          heroSection.style.padding = `${padding}px`;
          heroSticky.style.top = `${padding}px`;
          heroSticky.style.height = `calc(100vh - ${padding * 2}px)`;
          heroSticky.style.borderRadius = `${radius}px`;
          videoContainer.style.borderRadius = `${radius}px`;
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

  const featureStateCache = new WeakMap();

  function updateFeatureByScroll() {
    if (!layoutCacheValid) updateLayoutCache();
    const viewportHeight = cachedViewportHeight;

    featureScrollContainers.forEach((container) => {
      const textContent = container.querySelector(".feature-text-content");
      if (!textContent) return;

      const containerRect = container.getBoundingClientRect();
      const containerTop = containerRect.top;

      const scrollProgress = clamp01(-containerTop / (viewportHeight * 0.5));

      const lastState = featureStateCache.get(textContent) || { progress: -1 };
      if (Math.abs(scrollProgress - lastState.progress) < 0.01) return;

      featureStateCache.set(textContent, { progress: scrollProgress });

      const textScale = 1 - scrollProgress * 0.2;
      const textOpacity = 1 - scrollProgress;
      const featureTransform = `translate(-50%, -50%) scale(${textScale.toFixed(
        4
      )}) translateZ(0)`;
      textContent.style.transform = featureTransform;
      textContent.style.webkitTransform = featureTransform;
      textContent.style.opacity = textOpacity.toFixed(2);
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
        }
      });
    },
    { threshold: 0.5 }
  );

  underlineElements.forEach((el) => underlineObserver.observe(el));

  if (heroSticky) {
    heroSticky.style.transformOrigin = "center bottom";
    heroSticky.style.webkitTransformOrigin = "center bottom";
  }
  if (heroTextFlow) {
    heroTextFlow.style.transformOrigin = "center center";
    heroTextFlow.style.webkitTransformOrigin = "center center";
  }

  updateLayoutCache();
  updateHeroByScroll();
  updateVideoByScroll();
  updateNavbarByScroll();
  updateFeatureByScroll();
});

document.body.classList.add("loading");
