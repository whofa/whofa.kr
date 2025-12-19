document.addEventListener("DOMContentLoaded", () => {
  const heroSection = document.querySelector(".hero-section");
  const heroTexts = document.querySelectorAll(".hero-text");
  const dots = document.querySelectorAll(".dot");
  const heroContent = document.querySelector(".hero-content");
  const scrollIndicator = document.querySelector(".scroll-indicator");

  const totalSlides = heroTexts.length;
  const clamp01 = (value) => Math.min(Math.max(value, 0), 1);
  const smoothstep01 = (t) => t * t * (3 - 2 * t);

  function updateHeroByScroll() {
    const heroHeight = heroSection.offsetHeight;
    const viewportHeight = window.innerHeight;
    const scrollableHeight = Math.max(heroHeight - viewportHeight, 1);
    const scrollTop = window.scrollY;
    const progress = clamp01(scrollTop / scrollableHeight);

    const segments = Math.max(totalSlides, 1);
    const scaled = progress * segments;
    const index = Math.min(Math.floor(scaled), totalSlides - 1);
    const tRaw = scaled - index;
    const t = clamp01(tRaw);
    const fadeWindow = 0.6;
    const tWindowed = clamp01((t - (1 - fadeWindow) / 2) / fadeWindow);
    const ease = smoothstep01(tWindowed);

    heroTexts.forEach((text) => {
      text.style.opacity = "0";
      text.style.visibility = "hidden";
      text.style.zIndex = "10";
      text.style.transform = "translate(-50%, -50%) translateY(0px)";
    });

    const current = heroTexts[index];
    const next = heroTexts[Math.min(index + 1, totalSlides - 1)];

    const currentOpacity = index === totalSlides - 1 ? 1 : 1 - ease;
    const nextOpacity = index === totalSlides - 1 ? 0 : ease;

    const travel = 120;
    // 마지막 슬라이드에서는 transform 적용하지 않음
    const currentOffset = index === totalSlides - 1 ? 0 : -ease * travel;
    const nextOffset = (1 - ease) * travel;

    current.style.opacity = String(currentOpacity);
    current.style.visibility = currentOpacity > 0.02 ? "visible" : "hidden";
    current.style.zIndex = "12";
    current.style.transform = `translate(-50%, -50%) translateY(${currentOffset.toFixed(
      1
    )}px)`;

    if (next !== current) {
      next.style.opacity = String(nextOpacity);
      next.style.visibility = nextOpacity > 0.02 ? "visible" : "hidden";
      next.style.zIndex = "11";
      next.style.transform = `translate(-50%, -50%) translateY(${nextOffset.toFixed(
        1
      )}px)`;
    }

    const activeDot = Math.min(
      Math.round(progress * (totalSlides - 1)),
      totalSlides - 1
    );
    dots.forEach((dot, i) => dot.classList.toggle("active", i === activeDot));

    if (window.scrollY >= heroHeight - window.innerHeight) {
      heroContent.classList.add("hidden");
      scrollIndicator.classList.add("hidden");
    } else {
      heroContent.classList.remove("hidden");
      scrollIndicator.classList.remove("hidden");
    }
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

  function updateVideoByScroll() {
    const scrollY = window.scrollY;
    const heroHeight = heroSection.offsetHeight;

    videoContainer.classList.remove("hidden");
    videoContainer.style.transform = "translateY(0px)";

    const opacity = 1 - (scrollY / Math.max(heroHeight, 1)) * 0.5;
    videoContainer.style.opacity = String(Math.max(opacity, 0));
  }

  const navbar = document.querySelector(".navbar");
  const appSection = document.querySelector(".app-section");
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
  const navMenu = document.querySelector(".nav-menu");

  navToggle.addEventListener("click", () => {
    navToggle.classList.toggle("active");
    navMenu.classList.toggle("active");
  });

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      navToggle.classList.remove("active");
      navMenu.classList.remove("active");
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
