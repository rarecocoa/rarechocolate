/* ==========================================================
   RARE COCOA™ — Homepage Interactive Scripts
   Carousel · Scroll Reveals · Navigation · Smooth UX
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ── Hero Video (lazy-load after page ready) ──────────────
  const isMobile = () => window.innerWidth <= 768;

  const initHeroVideo = (videoEl) => {
    if (!videoEl) return;
    const source = videoEl.querySelector('source[data-src]');
    if (source) {
      source.src = source.getAttribute('data-src');
      source.removeAttribute('data-src');
      videoEl.load();
    }
    const showVideo = () => videoEl.classList.add('is-playing');
    videoEl.addEventListener('canplay',    showVideo, { once: true });
    videoEl.addEventListener('loadeddata', showVideo, { once: true });
    videoEl.addEventListener('playing',    showVideo, { once: true });
    setTimeout(showVideo, 3000);
    videoEl.play().catch(() => {});
  };

  const heroVideo       = document.getElementById('heroVideo');
  const heroVideoMobile = document.getElementById('heroVideoMobile');

  const checkAndInitVideo = () => {
    if (isMobile()) {
      if (heroVideoMobile && !heroVideoMobile.src && heroVideoMobile.querySelector('source[data-src]')) {
        initHeroVideo(heroVideoMobile);
      } else if (heroVideoMobile && heroVideoMobile.paused) {
        heroVideoMobile.play().catch(() => {});
      }
      if (heroVideo && !heroVideo.paused) {
        heroVideo.pause();
      }
    } else {
      if (heroVideo && !heroVideo.src && heroVideo.querySelector('source[data-src]')) {
        initHeroVideo(heroVideo);
      } else if (heroVideo && heroVideo.paused) {
        heroVideo.play().catch(() => {});
      }
      if (heroVideoMobile && !heroVideoMobile.paused) {
        heroVideoMobile.pause();
      }
    }
  };

  checkAndInitVideo();
  window.addEventListener('resize', checkAndInitVideo, { passive: true });

  // ── Navigation Scroll Behavior ───────────────────────────
  const nav = document.getElementById('nav');
  const heroSection = document.getElementById('hero');
  const handleNavScroll = () => {
    const scrolled = window.scrollY > 10;
    nav.classList.toggle('scrolled', scrolled);
  };

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  // ── Mobile Menu ──────────────────────────────────────────
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  let menuOpen = false;

  const toggleMenu = () => {
    menuOpen = !menuOpen;
    menuBtn.classList.toggle('active', menuOpen);
    mobileMenu.classList.toggle('open', menuOpen);
    document.body.style.overflow = menuOpen ? 'hidden' : '';
  };

  if (menuBtn) {
    menuBtn.addEventListener('click', toggleMenu);
  }

  // Close mobile menu on link click
  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (menuOpen) toggleMenu();
      });
    });
  }

  // ── Smooth Scroll for Anchor Links ───────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = nav ? nav.offsetHeight + 20 : 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ── Scroll Reveal (Intersection Observer) ────────────────
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  revealElements.forEach(el => revealObserver.observe(el));

  // ── Product Carousel ─────────────────────────────────────
  const track = document.getElementById('carouselTrack');
  const container = document.getElementById('carouselContainer');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const dotsContainer = document.getElementById('carouselDots');
  const slides = track ? track.querySelectorAll('.carousel-slide') : [];

  let currentIndex = 0;
  let slidesPerView = 3;
  let totalPages = 1;

  const updateSlidesPerView = () => {
    const w = window.innerWidth;
    if (w <= 480)       slidesPerView = 1;
    else if (w <= 768)  slidesPerView = 1;
    else if (w <= 1024) slidesPerView = 2;
    else                slidesPerView = 3;

    totalPages = Math.max(1, slides.length - slidesPerView + 1);
    if (currentIndex >= totalPages) currentIndex = totalPages - 1;
  };

  const moveCarousel = () => {
    if (!track || slides.length === 0) return;
    const slideWidth = 100 / slidesPerView;
    const offset = -(currentIndex * slideWidth);
    track.style.transform = `translateX(${offset}%)`;
    updateDots();
    updateButtons();
  };

  const updateButtons = () => {
    if (prevBtn) prevBtn.style.opacity = currentIndex === 0 ? '0.3' : '1';
    if (nextBtn) nextBtn.style.opacity = currentIndex >= totalPages - 1 ? '0.3' : '1';
  };

  // Dots
  const createDots = () => {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement('button');
      dot.className = `carousel-dot${i === currentIndex ? ' active' : ''}`;
      dot.setAttribute('aria-label', `Go to slide group ${i + 1}`);
      dot.addEventListener('click', () => {
        currentIndex = i;
        moveCarousel();
      });
      dotsContainer.appendChild(dot);
    }
  };

  const updateDots = () => {
    if (!dotsContainer) return;
    dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  };

  // Controls
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        moveCarousel();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentIndex < totalPages - 1) {
        currentIndex++;
        moveCarousel();
      }
    });
  }

  // Touch / swipe support for carousel
  let touchStartX = 0;
  let touchEndX = 0;

  if (container) {
    container.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0 && currentIndex < totalPages - 1) {
          currentIndex++;
          moveCarousel();
        } else if (diff < 0 && currentIndex > 0) {
          currentIndex--;
          moveCarousel();
        }
      }
    }, { passive: true });
  }

  // Initialize carousel
  const initCarousel = () => {
    updateSlidesPerView();
    slides.forEach(slide => {
      slide.style.minWidth = `${100 / slidesPerView}%`;
    });
    createDots();
    moveCarousel();
  };

  if (slides.length > 0) {
    initCarousel();
    window.addEventListener('resize', () => {
      updateSlidesPerView();
      slides.forEach(slide => {
        slide.style.minWidth = `${100 / slidesPerView}%`;
      });
      createDots();
      moveCarousel();
    });
  }

  // ── Auto-advance carousel (pause on hover) ──────────────
  let autoplayInterval = null;

  const startAutoplay = () => {
    autoplayInterval = setInterval(() => {
      if (currentIndex < totalPages - 1) {
        currentIndex++;
      } else {
        currentIndex = 0;
      }
      moveCarousel();
    }, 5000);
  };

  const stopAutoplay = () => {
    clearInterval(autoplayInterval);
  };

  if (slides.length > 0) {
    startAutoplay();
    const carouselEl = document.getElementById('carousel');
    if (carouselEl) {
      carouselEl.addEventListener('mouseenter', stopAutoplay);
      carouselEl.addEventListener('mouseleave', startAutoplay);
    }
  }

  // ── Parallax-subtle on hero scroll ───────────────────────
  const heroContent = document.querySelector('.hero-content');
  const heroScroll = document.querySelector('.hero-scroll');

  const handleHeroParallax = () => {
    if (!heroContent || window.innerWidth <= 768) return;
    const scrollY = window.scrollY;
    const heroHeight = heroSection ? heroSection.offsetHeight : 800;

    if (scrollY < heroHeight) {
      const progress = scrollY / heroHeight;
      heroContent.style.opacity = 1 - progress * 1.5;
      heroContent.style.transform = `translateY(${scrollY * 0.25}px)`;
      if (heroScroll) {
        heroScroll.style.opacity = 1 - progress * 3;
      }
    }
  };

  window.addEventListener('scroll', handleHeroParallax, { passive: true });

  // ── Counter animation for comparison items ───────────────
  const compareItems = document.querySelectorAll('.compare-item');

  const compareObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateX(0)';
          }, index * 80);
          compareObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  compareItems.forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateX(-12px)';
    item.style.transition = 'opacity 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1)';
    compareObserver.observe(item);
  });

  // Items on the "them" side animate from right
  document.querySelectorAll('.compare-item-them').forEach(item => {
    item.style.transform = 'translateX(12px)';
  });

  // ── Keyboard accessibility for carousel ──────────────────
  document.addEventListener('keydown', (e) => {
    const carouselEl = document.getElementById('carousel');
    if (!carouselEl) return;

    const rect = carouselEl.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;

    if (inView) {
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        currentIndex--;
        moveCarousel();
      } else if (e.key === 'ArrowRight' && currentIndex < totalPages - 1) {
        currentIndex++;
        moveCarousel();
      }
    }
  });

});
