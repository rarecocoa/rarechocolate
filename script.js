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
    setTimeout(showVideo, 800);
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
          if (entry.target.dataset.delay) {
            entry.target.style.transitionDelay = entry.target.dataset.delay + 'ms';
          }
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

  // ── Home Image Carousel ──────────────────────────────────
  const homeSlides = document.querySelectorAll('.home-carousel-slide');
  const homeDots = document.querySelectorAll('.home-carousel-dot');
  let homeCurrentIndex = 0;
  let homeAutoplayInterval = null;

  const showHomeSlide = (index) => {
    if (homeSlides.length === 0) return;
    homeSlides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });
    homeDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
    homeCurrentIndex = index;
  };

  const nextHomeSlide = () => {
    let nextIndex = homeCurrentIndex + 1;
    if (nextIndex >= homeSlides.length) nextIndex = 0;
    showHomeSlide(nextIndex);
  };

  const prevHomeSlide = () => {
    let prevIndex = homeCurrentIndex - 1;
    if (prevIndex < 0) prevIndex = homeSlides.length - 1;
    showHomeSlide(prevIndex);
  };

  const startHomeAutoplay = () => {
    if (homeSlides.length <= 1) return;
    stopHomeAutoplay();
    homeAutoplayInterval = setInterval(nextHomeSlide, 4000);
  };

  const stopHomeAutoplay = () => {
    if (homeAutoplayInterval) {
      clearInterval(homeAutoplayInterval);
      homeAutoplayInterval = null;
    }
  };

  if (homeSlides.length > 0) {
    showHomeSlide(0);
    startHomeAutoplay();

    // Click dots to navigate
    homeDots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        stopHomeAutoplay();
        showHomeSlide(index);
        startHomeAutoplay();
      });
    });

    // Pause on hover
    const carouselContainer = document.querySelector('.home-carousel-container');
    if (carouselContainer) {
      carouselContainer.addEventListener('mouseenter', stopHomeAutoplay);
      carouselContainer.addEventListener('mouseleave', startHomeAutoplay);
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

  // ── FAQ Accordion Interactivity ──────────────────────────
  const faqTriggers = document.querySelectorAll('.faq-trigger');
  
  faqTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const parent = trigger.parentElement;
      const isOpen = parent.classList.contains('active');
      
      // Close all other FAQs
      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
        item.querySelector('.faq-trigger').setAttribute('aria-expanded', 'false');
        const content = item.querySelector('.faq-content');
        if (content) content.style.maxHeight = null;
      });
      
      if (!isOpen) {
        parent.classList.add('active');
        trigger.setAttribute('aria-expanded', 'true');
        const content = parent.querySelector('.faq-content');
        if (content) content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });

});
