// ============================================================================
// THE FLICK STUDIO DUBAI — 3D CORRIDOR PARALLAX & SIDE-SCROLLING ENGINE
// Synchronizes:
// 1. Upper Floor (Ceiling Beams) moving with 3D Parallax (Speed 0.4)
// 2. Lower Floor (Reflective Ground) moving with 3D Parallax (Speed 0.7)
// 3. Middle Content Track moving Sideways (Speed 1.0)
// 4. Full-Screen Dual-Column Drawer Menu
// 5. In-RAM Real-Time Booking & SSE Synchronization
// ============================================================================

const TOTAL_WALLS = 11;
const TOTAL_AGENCY_SLIDES = 2;
const TOTAL_BRAND_SLIDES = 5;
const TOTAL_WEBDESIGN_SLIDES = 5;
const TOTAL_IMPACT_SLIDES = 4;
const TOTAL_SEO_SLIDES = 5;
const TOTAL_VERTICAL_SLIDES = 5;
const TOTAL_SOCIAL_SLIDES = 5;
const TOTAL_EMAIL_SLIDES = 5;
const TOTAL_PHOTO_SLIDES = 5;
const TOTAL_APP_SLIDES = 5;
let currentWallIndex = 0;
let currentAgencySlide = 0;
let currentBrandSlide = 0;
let currentWebDesignSlide = 0;
let currentImpactSlide = 0;
let currentSeoSlide = 0;
let currentVerticalSlide = 0;
let currentSocialSlide = 0;
let currentEmailSlide = 0;
let currentPhotoSlide = 0;
let currentAppSlide = 0;
let currentX = 0;
let targetX = 0;
let isAnimating = false;
let animStartTime = 0;
let animStartX = 0;
let animTargetX = 0;
const SLIDE_DURATION = 420; // 420ms: fast, responsive, and cinematic

let isDragging = false;
let dragStartX = 0;
let dragCurrentX = 0;
let dragStartTime = 0;

let wheelCooldown = false;
let wheelDeltaSum = 0;
let wheelTimer = null;
let activeBookingSlotId = 1;

// Quintic Ease-Out: Rapid initial displacement, buttery deceleration, dead stop on exact pixel
function easeOutQuint(x) {
  return 1 - Math.pow(1 - x, 5);
}

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initFlickLogoWave();
  initPortfolioVideos();
  initVideoKiosk();
  initAutoHideTaskbar();
  initCorridorParallax();
  initAgencyDeck();
  initBrandDesignDeck();
  initWebDesignDeck();
  initImpactDeck();
  initSeoDeck();
  initVerticalDeck();
  initSocialDeck();
  initEmailDeck();
  initPhotoDeck();
  initAppDeck();
  initDrawerMenu();
  initLiveSlots();
  initSSEListener();
  initBookingModal();
  initAgentTerminal();
});

// 1. 3D Corridor Parallax Engine (Upper Floor, Lower Floor, Middle Sideways)
function initCorridorParallax() {
  const viewport = document.getElementById('corridor-viewport');
  const track = document.getElementById('corridor-track');
  const ceiling = document.getElementById('corridor-ceiling');
  const floor = document.getElementById('corridor-floor');

  if (!viewport || !track) return;

  function applyParallaxTransforms(x) {
    track.style.transform = `translate3d(${-x}px, 0, 0)`;

    if (ceiling) {
      ceiling.style.backgroundPosition = `${-x * 0.38}px 0`;
      ceiling.style.transform = `rotateX(45deg) translate3d(${-x * 0.05}px, 0, 0)`;
    }

    if (floor) {
      floor.style.backgroundPosition = `${-x * 0.68}px 0`;
      floor.style.transform = `rotateX(-50deg) translate3d(${-x * 0.08}px, 0, 0)`;
    }
  }

  // Animation Step Function
  function stepSlide(now) {
    if (!isAnimating) return;

    const elapsed = now - animStartTime;
    const progress = Math.min(1, elapsed / SLIDE_DURATION);
    const easedProgress = easeOutQuint(progress);

    currentX = animStartX + (animTargetX - animStartX) * easedProgress;
    applyParallaxTransforms(currentX);

    if (progress < 1) {
      requestAnimationFrame(stepSlide);
    } else {
      // STOP FIRMLY ONCE FULLY LOADED
      currentX = animTargetX;
      applyParallaxTransforms(currentX);
      isAnimating = false;
      updateActiveWallClass(currentWallIndex);
      updateHudPills(currentWallIndex);
    }
  }

  window.glideToWall = function(index, immediate = false) {
    const boundedIndex = Math.max(0, Math.min(index, TOTAL_WALLS - 1));
    currentWallIndex = boundedIndex;
    targetX = currentWallIndex * window.innerWidth;
    updateHudPills(currentWallIndex);

    if (immediate || Math.abs(targetX - currentX) < 1) {
      currentX = targetX;
      applyParallaxTransforms(currentX);
      isAnimating = false;
      updateActiveWallClass(currentWallIndex);
      return;
    }

    animStartX = currentX;
    animTargetX = targetX;
    animStartTime = performance.now();
    isAnimating = true;

    // Trigger focus and settle on target room
    updateActiveWallClass(currentWallIndex);
    requestAnimationFrame(stepSlide);
  };

  window.glideNext = function() {
    if (currentWallIndex < TOTAL_WALLS - 1) {
      glideToWall(currentWallIndex + 1);
    }
  };

  window.glidePrev = function() {
    if (currentWallIndex > 0) {
      glideToWall(currentWallIndex - 1);
    }
  };

  // Mouse Wheel: Fast, smooth page-by-page slide with firm full-stop
  window.addEventListener('wheel', (e) => {
    const drawer = document.getElementById('full-screen-drawer');
    const modal = document.getElementById('booking-modal-overlay');
    if (
      drawer?.classList.contains('open') || 
      modal?.classList.contains('active') ||
      e.target.closest('#flick-video-kiosk') ||
      e.target.closest('#bottom-hud-bar')
    ) return;

    // If inside a scrollable container inside a slide that has scroll remaining, let it scroll naturally
    const scrollable = e.target.closest('.faq-accordion-list');
    if (scrollable) {
      const atTop = scrollable.scrollTop <= 0;
      const atBottom = Math.ceil(scrollable.scrollTop + scrollable.clientHeight) >= scrollable.scrollHeight;
      if (e.deltaY > 0 && !atBottom) return;
      if (e.deltaY < 0 && !atTop) return;
    }

    e.preventDefault();

    if (wheelCooldown) return;

    wheelDeltaSum += e.deltaY + (e.deltaX || 0);

    if (Math.abs(wheelDeltaSum) >= 28) {
      wheelCooldown = true;

      if (currentWallIndex === 0 && Math.abs(e.deltaY) >= Math.abs(e.deltaX || 0)) {
        if (wheelDeltaSum > 0) {
          if (currentAgencySlide < TOTAL_AGENCY_SLIDES - 1) {
            glideAgencyNext();
          } else {
            glideNext();
          }
        } else {
          if (currentAgencySlide > 0) {
            glideAgencyPrev();
          } else {
            glidePrev();
          }
        }
      } else if (currentWallIndex === 1 && Math.abs(e.deltaY) >= Math.abs(e.deltaX || 0)) {
        if (wheelDeltaSum > 0) {
          if (currentBrandSlide < TOTAL_BRAND_SLIDES - 1) {
            glideBrandNext();
          } else {
            glideNext();
          }
        } else {
          if (currentBrandSlide > 0) {
            glideBrandPrev();
          } else {
            glidePrev();
          }
        }
      } else if (currentWallIndex === 2 && Math.abs(e.deltaY) >= Math.abs(e.deltaX || 0)) {
        if (wheelDeltaSum > 0) {
          if (currentWebDesignSlide < TOTAL_WEBDESIGN_SLIDES - 1) {
            glideWebDesignNext();
          } else {
            glideNext();
          }
        } else {
          if (currentWebDesignSlide > 0) {
            glideWebDesignPrev();
          } else {
            glidePrev();
          }
        }
      } else if (currentWallIndex === 3 && Math.abs(e.deltaY) >= Math.abs(e.deltaX || 0)) {
        if (wheelDeltaSum > 0) {
          if (currentImpactSlide < TOTAL_IMPACT_SLIDES - 1) {
            glideImpactNext();
          } else {
            glideNext();
          }
        } else {
          if (currentImpactSlide > 0) {
            glideImpactPrev();
          } else {
            glidePrev();
          }
        }
      } else if (currentWallIndex === 4 && Math.abs(e.deltaY) >= Math.abs(e.deltaX || 0)) {
        if (wheelDeltaSum > 0) {
          if (currentSeoSlide < TOTAL_SEO_SLIDES - 1) {
            glideSeoNext();
          } else {
            glideNext();
          }
        } else {
          if (currentSeoSlide > 0) {
            glideSeoPrev();
          } else {
            glidePrev();
          }
        }
      } else if (currentWallIndex === 5 && Math.abs(e.deltaY) >= Math.abs(e.deltaX || 0)) {
        if (wheelDeltaSum > 0) {
          if (currentVerticalSlide < TOTAL_VERTICAL_SLIDES - 1) {
            glideVerticalNext();
          } else {
            glideNext();
          }
        } else {
          if (currentVerticalSlide > 0) {
            glideVerticalPrev();
          } else {
            glidePrev();
          }
        }
      } else if (currentWallIndex === 6 && Math.abs(e.deltaY) >= Math.abs(e.deltaX || 0)) {
        if (wheelDeltaSum > 0) {
          if (currentSocialSlide < TOTAL_SOCIAL_SLIDES - 1) {
            glideSocialNext();
          } else {
            glideNext();
          }
        } else {
          if (currentSocialSlide > 0) {
            glideSocialPrev();
          } else {
            glidePrev();
          }
        }
      } else if (currentWallIndex === 7 && Math.abs(e.deltaY) >= Math.abs(e.deltaX || 0)) {
        if (wheelDeltaSum > 0) {
          if (currentEmailSlide < TOTAL_EMAIL_SLIDES - 1) {
            glideEmailNext();
          } else {
            glideNext();
          }
        } else {
          if (currentEmailSlide > 0) {
            glideEmailPrev();
          } else {
            glidePrev();
          }
        }
      } else if (currentWallIndex === 8 && Math.abs(e.deltaY) >= Math.abs(e.deltaX || 0)) {
        if (wheelDeltaSum > 0) {
          if (currentPhotoSlide < TOTAL_PHOTO_SLIDES - 1) {
            glidePhotoNext();
          } else {
            glideNext();
          }
        } else {
          if (currentPhotoSlide > 0) {
            glidePhotoPrev();
          } else {
            glidePrev();
          }
        }
      } else if (currentWallIndex === 9 && Math.abs(e.deltaY) >= Math.abs(e.deltaX || 0)) {
        if (wheelDeltaSum > 0) {
          if (currentAppSlide < TOTAL_APP_SLIDES - 1) {
            glideAppNext();
          } else {
            glideNext();
          }
        } else {
          if (currentAppSlide > 0) {
            glideAppPrev();
          } else {
            glidePrev();
          }
        }
      } else {
        if (wheelDeltaSum > 0) {
          glideNext();
        } else {
          glidePrev();
        }
      }

      wheelDeltaSum = 0;
      setTimeout(() => {
        wheelCooldown = false;
      }, 440);
    }

    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => {
      wheelDeltaSum = 0;
    }, 150);
  }, { passive: false });

  // Mouse Drag: Real-time tracking + momentum flick snapping
  window.addEventListener('mousedown', (e) => {
    if (
      e.target.closest('button') || 
      e.target.closest('a') || 
      e.target.closest('input') || 
      e.target.closest('select') ||
      e.target.closest('#flick-video-kiosk') ||
      e.target.closest('#bottom-hud-bar')
    ) return;
    const drawer = document.getElementById('full-screen-drawer');
    const modal = document.getElementById('booking-modal-overlay');
    if (drawer?.classList.contains('open') || modal?.classList.contains('active')) return;

    isDragging = true;
    dragStartX = e.clientX;
    dragCurrentX = currentX;
    dragStartTime = performance.now();
    isAnimating = false;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaX = (dragStartX - e.clientX) * 1.15;
    currentX = Math.max(0, Math.min(dragCurrentX + deltaX, (TOTAL_WALLS - 1) * window.innerWidth));
    applyParallaxTransforms(currentX);
  });

  window.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    const totalDelta = dragStartX - e.clientX;
    const timeElapsed = performance.now() - dragStartTime;
    const velocity = Math.abs(totalDelta) / (timeElapsed || 1);

    if (totalDelta > 70 || (velocity > 0.35 && totalDelta > 20)) {
      glideNext();
    } else if (totalDelta < -70 || (velocity > 0.35 && totalDelta < -20)) {
      glidePrev();
    } else {
      const nearestIndex = Math.round(currentX / window.innerWidth);
      glideToWall(nearestIndex);
    }
  });

  // Unified Touch Gesture Engine (Rooms 00 - 10 Horizontal & Vertical Decks)
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;
  let isTouchDragging = false;
  let touchMoved = false;

  window.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    const target = e.target;
    if (
      target.closest('button, a, input, select, textarea') || 
      target.closest('#flick-video-kiosk') || 
      target.closest('#bottom-hud-bar')
    ) return;

    const drawer = document.getElementById('full-screen-drawer');
    const modal = document.getElementById('booking-modal-overlay');
    if (drawer?.classList.contains('open') || modal?.classList.contains('active')) return;

    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchStartTime = performance.now();
    isTouchDragging = true;
    touchMoved = false;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!isTouchDragging || e.touches.length !== 1) return;
    touchMoved = true;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    if (!isTouchDragging) return;
    isTouchDragging = false;
    if (!touchMoved) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const totalDeltaX = touchStartX - touchEndX;
    const totalDeltaY = touchStartY - touchEndY;
    const absDeltaX = Math.abs(totalDeltaX);
    const absDeltaY = Math.abs(totalDeltaY);

    // Minimum gesture threshold (ignore micro-taps)
    if (absDeltaX < 28 && absDeltaY < 28) return;

    // Check if touch originated in an inner scrollable element with remaining scroll
    const scrollable = e.target.closest('.faq-accordion-list, .flick-contact-form, .terminal-inspector-box');
    if (scrollable) {
      const atTop = scrollable.scrollTop <= 2;
      const atBottom = Math.ceil(scrollable.scrollTop + scrollable.clientHeight) >= scrollable.scrollHeight - 2;
      if (absDeltaY > absDeltaX) {
        if (totalDeltaY > 0 && !atBottom) return;
        if (totalDeltaY < 0 && !atTop) return;
      }
    }

    // 1. Horizontal Room Gliding (Dominant X vector)
    if (absDeltaX > absDeltaY && absDeltaX > 38) {
      if (totalDeltaX > 0) {
        glideNext();
      } else {
        glidePrev();
      }
      return;
    }

    // 2. Vertical Slide Stepping (Dominant Y vector)
    if (absDeltaY >= absDeltaX && absDeltaY > 38) {
      if (currentWallIndex === 0) {
        if (totalDeltaY > 0) glideAgencyNext();
        else glideAgencyPrev();
      } else if (currentWallIndex === 1) {
        if (totalDeltaY > 0) glideBrandNext();
        else glideBrandPrev();
      } else if (currentWallIndex === 2) {
        if (totalDeltaY > 0) glideWebDesignNext();
        else glideWebDesignPrev();
      } else if (currentWallIndex === 3) {
        if (totalDeltaY > 0) glideImpactNext();
        else glideImpactPrev();
      } else if (currentWallIndex === 4) {
        if (totalDeltaY > 0) glideSeoNext();
        else glideSeoPrev();
      } else if (currentWallIndex === 5) {
        if (totalDeltaY > 0) glideVerticalNext();
        else glideVerticalPrev();
      } else if (currentWallIndex === 6) {
        if (totalDeltaY > 0) glideSocialNext();
        else glideSocialPrev();
      } else if (currentWallIndex === 7) {
        if (totalDeltaY > 0) glideEmailNext();
        else glideEmailPrev();
      } else if (currentWallIndex === 8) {
        if (totalDeltaY > 0) glidePhotoNext();
        else glidePhotoPrev();
      } else if (currentWallIndex === 9) {
        if (totalDeltaY > 0) glideAppNext();
        else glideAppPrev();
      } else if (currentWallIndex === 10) {
        if (totalDeltaY < 0) glidePrev();
      }
    }
  }, { passive: true });

  // Keyboard controls
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      if (currentWallIndex === 0) {
        if (currentAgencySlide < TOTAL_AGENCY_SLIDES - 1) {
          e.preventDefault();
          glideAgencyNext();
          return;
        }
      } else if (currentWallIndex === 1) {
        if (currentBrandSlide < TOTAL_BRAND_SLIDES - 1) {
          e.preventDefault();
          glideBrandNext();
          return;
        }
      } else if (currentWallIndex === 2) {
        if (currentWebDesignSlide < TOTAL_WEBDESIGN_SLIDES - 1) {
          e.preventDefault();
          glideWebDesignNext();
          return;
        }
      } else if (currentWallIndex === 3) {
        if (currentImpactSlide < TOTAL_IMPACT_SLIDES - 1) {
          e.preventDefault();
          glideImpactNext();
          return;
        }
      } else if (currentWallIndex === 4) {
        if (currentSeoSlide < TOTAL_SEO_SLIDES - 1) {
          e.preventDefault();
          glideSeoNext();
          return;
        }
      } else if (currentWallIndex === 5) {
        if (currentVerticalSlide < TOTAL_VERTICAL_SLIDES - 1) {
          e.preventDefault();
          glideVerticalNext();
          return;
        }
      } else if (currentWallIndex === 6) {
        if (currentSocialSlide < TOTAL_SOCIAL_SLIDES - 1) {
          e.preventDefault();
          glideSocialNext();
          return;
        }
      } else if (currentWallIndex === 7) {
        if (currentEmailSlide < TOTAL_EMAIL_SLIDES - 1) {
          e.preventDefault();
          glideEmailNext();
          return;
        }
      } else if (currentWallIndex === 8) {
        if (currentPhotoSlide < TOTAL_PHOTO_SLIDES - 1) {
          e.preventDefault();
          glidePhotoNext();
          return;
        }
      } else if (currentWallIndex === 9) {
        if (currentAppSlide < TOTAL_APP_SLIDES - 1) {
          e.preventDefault();
          glideAppNext();
          return;
        }
      }
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      if (currentWallIndex === 0) {
        if (currentAgencySlide > 0) {
          e.preventDefault();
          glideAgencyPrev();
          return;
        }
      } else if (currentWallIndex === 1) {
        if (currentBrandSlide > 0) {
          e.preventDefault();
          glideBrandPrev();
          return;
        }
      } else if (currentWallIndex === 2) {
        if (currentWebDesignSlide > 0) {
          e.preventDefault();
          glideWebDesignPrev();
          return;
        }
      } else if (currentWallIndex === 3) {
        if (currentImpactSlide > 0) {
          e.preventDefault();
          glideImpactPrev();
          return;
        }
      } else if (currentWallIndex === 4) {
        if (currentSeoSlide > 0) {
          e.preventDefault();
          glideSeoPrev();
          return;
        }
      } else if (currentWallIndex === 5) {
        if (currentVerticalSlide > 0) {
          e.preventDefault();
          glideVerticalPrev();
          return;
        }
      } else if (currentWallIndex === 6) {
        if (currentSocialSlide > 0) {
          e.preventDefault();
          glideSocialPrev();
          return;
        }
      } else if (currentWallIndex === 7) {
        if (currentEmailSlide > 0) {
          e.preventDefault();
          glideEmailPrev();
          return;
        }
      } else if (currentWallIndex === 8) {
        if (currentPhotoSlide > 0) {
          e.preventDefault();
          glidePhotoPrev();
          return;
        }
      } else if (currentWallIndex === 9) {
        if (currentAppSlide > 0) {
          e.preventDefault();
          glideAppPrev();
          return;
        }
      }
    }

    if (e.key === 'ArrowRight') {
      glideNext();
    } else if (e.key === 'ArrowLeft') {
      glidePrev();
    } else if (e.key === 'PageDown') {
      glideNext();
    } else if (e.key === 'PageUp') {
      glidePrev();
    } else if (e.key === 'Home') {
      glideToWall(0);
    } else if (e.key === 'End') {
      glideToWall(TOTAL_WALLS - 1);
    } else if (e.key === 'Escape') {
      toggleDrawer(false);
      closeBookingModal();
    }
  });

  // Dynamic Resize & Orientation Change Engine
  let resizeTimer = null;
  function handleViewportResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      targetX = currentWallIndex * window.innerWidth;
      currentX = targetX;
      applyParallaxTransforms(currentX);
    }, 50);
  }
  window.addEventListener('resize', handleViewportResize, { passive: true });
  window.addEventListener('orientationchange', handleViewportResize, { passive: true });

  // Deep Linking & Hash Routing (#services-section, #wall-2, etc.)
  initHashRouting();
}

function updateActiveWallClass(activeIndex) {
  const walls = document.querySelectorAll('.corridor-wall-room');
  walls.forEach((wall, idx) => {
    if (idx === activeIndex) {
      wall.classList.add('is-active');
    } else {
      wall.classList.remove('is-active');
    }
  });
}

function updateHudPills(activeIndex) {
  const pills = document.querySelectorAll('.hud-pill');
  pills.forEach((pill, idx) => {
    if (idx === activeIndex) {
      pill.classList.add('active');
      // Scroll active pill into view on mobile scrollable HUD bar
      try {
        pill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      } catch (_) {}
    } else {
      pill.classList.remove('active');
    }
  });
}

function initHashRouting() {
  const HASH_MAP = {
    '#wall-0': 0,
    '#manifesto': 0,
    '#flick': 0,
    '#agency': 0,
    '#agency-section': 0,
    '#about': 0,
    '#about-us': 0,
    '#who-we-are': 0,
    '#wall-1': 1,
    '#branding': 1,
    '#branding-section': 1,
    '#brand-design': 1,
    '#branding-design': 1,
    '#brand': 1,
    '#hype-outfit': 1,
    '#wall-2': 2,
    '#services': 2,
    '#services-section': 2,
    '#web-design': 2,
    '#webdesign': 2,
    '#web': 2,
    '#pricing': 2,
    '#wall-3': 3,
    '#portfolio': 3,
    '#portfolio-section': 3,
    '#vault': 3,
    '#proven-impact': 3,
    '#wall-4': 4,
    '#seo': 4,
    '#geo': 4,
    '#ai-search': 4,
    '#search': 4,
    '#search-section': 4,
    '#organic': 4,
    '#wall-5': 5,
    '#ads': 5,
    '#performance': 5,
    '#performance-marketing': 5,
    '#ads-performance': 5,
    '#ads-section': 5,
    '#marketing': 5,
    '#growth': 5,
    '#booking': 5,
    '#schedule': 5,
    '#podcast': 5,
    '#wall-6': 6,
    '#social': 6,
    '#social-media': 6,
    '#content': 6,
    '#content-management': 6,
    '#social-section': 6,
    '#buzz': 6,
    '#wall-7': 7,
    '#email': 7,
    '#email-marketing': 7,
    '#campaigns': 7,
    '#email-section': 7,
    '#inbox': 7,
    '#wall-8': 8,
    '#photo': 8,
    '#photography': 8,
    '#video': 8,
    '#videography': 8,
    '#production': 8,
    '#photo-section': 8,
    '#wall-9': 9,
    '#app': 9,
    '#app-dev': 9,
    '#app-development': 9,
    '#apps': 9,
    '#mobile': 9,
    '#mobile-app': 9,
    '#ui-ux': 9,
    '#uiux': 9,
    '#app-section': 9,
    '#wall-10': 10,
    '#contact': 10,
    '#contact-us': 10,
    '#contact-section': 10,
    '#agent': 10,
    '#agent-hub': 10,
    '#api': 10
  };

  function resolveHash() {
    const hash = window.location.hash.toLowerCase();
    if (hash === '#formula') {
      window.glideToWall(5, false);
      window.glideToVerticalSlide(2);
    } else if (hash === '#process') {
      window.glideToWall(5, false);
      window.glideToVerticalSlide(3);
    } else if (hash === '#faq' || hash === '#faqs') {
      window.glideToWall(5, false);
      window.glideToVerticalSlide(4);
    } else if (hash && HASH_MAP[hash] !== undefined) {
      window.glideToWall(HASH_MAP[hash], false);
      if (HASH_MAP[hash] === 9) {
        if (window.glideToAppSlide) window.glideToAppSlide(0);
      } else if (HASH_MAP[hash] === 8) {
        if (window.glideToPhotoSlide) window.glideToPhotoSlide(0);
      } else if (HASH_MAP[hash] === 7) {
        if (window.glideToEmailSlide) window.glideToEmailSlide(0);
      } else if (HASH_MAP[hash] === 6) {
        if (window.glideToSocialSlide) window.glideToSocialSlide(0);
      } else if (HASH_MAP[hash] === 5) {
        window.glideToVerticalSlide(0);
      } else if (HASH_MAP[hash] === 4) {
        if (window.glideToSeoSlide) window.glideToSeoSlide(0);
      }
    } else {
      updateActiveWallClass(currentWallIndex);
    }
  }

  // On initial page load or browser refresh, always land on Home Page (Wall 0, Slide 0)
  if (window.location.hash) {
    try {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    } catch (err) {}
  }
  window.glideToWall(0, false);
  if (typeof window.glideToAgencySlide === 'function') {
    window.glideToAgencySlide(0);
  }

  window.addEventListener('hashchange', resolveHash);
}

// 1B0. Room 01 Agency & Identity Vertical Deck Navigation (Manifesto -> Who We Are)
function initAgencyDeck() {
  const track = document.getElementById('agency-deck-track');
  const btnUp = document.getElementById('agency-step-up');
  const btnDown = document.getElementById('agency-step-down');

  window.glideToAgencySlide = function(index) {
    const bounded = Math.max(0, Math.min(index, TOTAL_AGENCY_SLIDES - 1));
    currentAgencySlide = bounded;

    if (track) {
      track.style.transform = `translate3d(0, ${-currentAgencySlide * 100}%, 0)`;
    }

    const pills = document.querySelectorAll('#agency-stepper-dock .v-step-pill');
    pills.forEach((pill, idx) => {
      if (idx === currentAgencySlide) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    if (btnUp) btnUp.disabled = (currentAgencySlide === 0);
    if (btnDown) btnDown.disabled = (currentAgencySlide === TOTAL_AGENCY_SLIDES - 1);

    const targetSlide = document.getElementById(`agency-slide-${currentAgencySlide}`);
    if (targetSlide) {
      targetSlide.scrollTop = 0;
    }
  };

  window.glideAgencyNext = function() {
    if (currentAgencySlide < TOTAL_AGENCY_SLIDES - 1) {
      glideToAgencySlide(currentAgencySlide + 1);
    } else {
      glideToWall(1);
    }
  };

  window.glideAgencyPrev = function() {
    if (currentAgencySlide > 0) {
      glideToAgencySlide(currentAgencySlide - 1);
    }
  };
}

// 1B1. Room 02 Branding Design Vertical Deck Navigation
function initBrandDesignDeck() {
  const track = document.getElementById('brand-deck-track');
  const btnUp = document.getElementById('brand-step-up');
  const btnDown = document.getElementById('brand-step-down');

  window.glideToBrandSlide = function(index) {
    const bounded = Math.max(0, Math.min(index, TOTAL_BRAND_SLIDES - 1));
    currentBrandSlide = bounded;

    if (track) {
      track.style.transform = `translate3d(0, ${-currentBrandSlide * 100}%, 0)`;
    }

    const pills = document.querySelectorAll('#brand-stepper-dock .v-step-pill');
    pills.forEach((pill, idx) => {
      if (idx === currentBrandSlide) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    if (btnUp) btnUp.disabled = (currentBrandSlide === 0);
    if (btnDown) btnDown.disabled = (currentBrandSlide === TOTAL_BRAND_SLIDES - 1);

    const targetSlide = document.getElementById(`brand-slide-${currentBrandSlide}`);
    if (targetSlide) {
      targetSlide.scrollTop = 0;
    }
  };

  window.glideBrandNext = function() {
    if (currentBrandSlide < TOTAL_BRAND_SLIDES - 1) {
      glideToBrandSlide(currentBrandSlide + 1);
    } else {
      glideToWall(2);
    }
  };

  window.glideBrandPrev = function() {
    if (currentBrandSlide > 0) {
      glideToBrandSlide(currentBrandSlide - 1);
    } else {
      glideToWall(0);
    }
  };

  window.toggleBrandFaq = function(btn) {
    const item = btn.closest('.faq-item');
    if (!item) return;
    const wasOpen = item.classList.contains('is-open');
    document.querySelectorAll('#brand-faq-list .faq-item').forEach(el => el.classList.remove('is-open'));
    if (!wasOpen) {
      item.classList.add('is-open');
    }
  };
}

// 1B1b. Room 05 AI Search & Agent-Ready SEO Vertical Deck Navigation
function initSeoDeck() {
  const track = document.getElementById('seo-deck-track');
  const btnUp = document.getElementById('seo-step-up');
  const btnDown = document.getElementById('seo-step-down');

  window.glideToSeoSlide = function(index) {
    const bounded = Math.max(0, Math.min(index, TOTAL_SEO_SLIDES - 1));
    currentSeoSlide = bounded;

    if (track) {
      track.style.transform = `translate3d(0, ${-currentSeoSlide * 100}%, 0)`;
    }

    const pills = document.querySelectorAll('#seo-stepper-dock .v-step-pill');
    pills.forEach((pill, idx) => {
      if (idx === currentSeoSlide) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    if (btnUp) btnUp.disabled = (currentSeoSlide === 0);
    if (btnDown) btnDown.disabled = (currentSeoSlide === TOTAL_SEO_SLIDES - 1);

    const targetSlide = document.getElementById(`seo-slide-${currentSeoSlide}`);
    if (targetSlide) {
      targetSlide.scrollTop = 0;
    }
  };

  window.glideSeoNext = function() {
    if (currentSeoSlide < TOTAL_SEO_SLIDES - 1) {
      glideToSeoSlide(currentSeoSlide + 1);
    } else {
      glideToWall(5);
    }
  };

  window.glideSeoPrev = function() {
    if (currentSeoSlide > 0) {
      glideToSeoSlide(currentSeoSlide - 1);
    } else {
      glideToWall(3);
    }
  };

  window.toggleSeoFaq = function(btn) {
    const item = btn.closest('.faq-item');
    if (!item) return;
    const wasOpen = item.classList.contains('is-open');
    document.querySelectorAll('#seo-faq-list .faq-item').forEach(el => el.classList.remove('is-open'));
    if (!wasOpen) {
      item.classList.add('is-open');
    }
  };
}

// 1B. Room 06 Vertical Deck Navigation & Interactive FAQs (Ads & Performance)
function initVerticalDeck() {
  const track = document.getElementById('vertical-deck-track');
  const btnUp = document.getElementById('v-step-up');
  const btnDown = document.getElementById('v-step-down');

  window.glideToVerticalSlide = function(index) {
    const bounded = Math.max(0, Math.min(index, TOTAL_VERTICAL_SLIDES - 1));
    currentVerticalSlide = bounded;

    if (track) {
      track.style.transform = `translate3d(0, ${-currentVerticalSlide * 100}%, 0)`;
    }

    const pills = document.querySelectorAll('#v-stepper-dock .v-step-pill');
    pills.forEach((pill, idx) => {
      if (idx === currentVerticalSlide) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    if (btnUp) btnUp.disabled = (currentVerticalSlide === 0);
    if (btnDown) btnDown.disabled = (currentVerticalSlide === TOTAL_VERTICAL_SLIDES - 1);

    const targetSlide = document.getElementById(`v-slide-${currentVerticalSlide}`);
    if (targetSlide) {
      targetSlide.scrollTop = 0;
    }
  };

  window.glideVerticalNext = function() {
    if (currentVerticalSlide < TOTAL_VERTICAL_SLIDES - 1) {
      glideToVerticalSlide(currentVerticalSlide + 1);
    } else {
      glideToWall(6);
    }
  };

  window.glideVerticalPrev = function() {
    if (currentVerticalSlide > 0) {
      glideToVerticalSlide(currentVerticalSlide - 1);
    } else {
      glideToWall(4);
    }
  };

  window.toggleFaq = function(btn) {
    const item = btn.closest('.faq-item');
    if (!item) return;
    const wasOpen = item.classList.contains('is-open');
    document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('is-open'));
    if (!wasOpen) {
      item.classList.add('is-open');
    }
  };
}

// 1B1. Room 07 Social Media & Content Management Vertical Deck Navigation
function initSocialDeck() {
  const track = document.getElementById('social-deck-track');
  const btnUp = document.getElementById('social-step-up');
  const btnDown = document.getElementById('social-step-down');

  window.glideToSocialSlide = function(index) {
    const bounded = Math.max(0, Math.min(index, TOTAL_SOCIAL_SLIDES - 1));
    currentSocialSlide = bounded;

    if (track) {
      track.style.transform = `translate3d(0, ${-currentSocialSlide * 100}%, 0)`;
    }

    const pills = document.querySelectorAll('#social-stepper-dock .v-step-pill');
    pills.forEach((pill, idx) => {
      if (idx === currentSocialSlide) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    if (btnUp) btnUp.disabled = (currentSocialSlide === 0);
    if (btnDown) btnDown.disabled = (currentSocialSlide === TOTAL_SOCIAL_SLIDES - 1);

    const targetSlide = document.getElementById(`social-slide-${currentSocialSlide}`);
    if (targetSlide) {
      targetSlide.scrollTop = 0;
    }
  };

  window.glideSocialNext = function() {
    if (currentSocialSlide < TOTAL_SOCIAL_SLIDES - 1) {
      glideToSocialSlide(currentSocialSlide + 1);
    } else {
      glideToWall(7);
    }
  };

  window.glideSocialPrev = function() {
    if (currentSocialSlide > 0) {
      glideToSocialSlide(currentSocialSlide - 1);
    } else {
      glideToWall(5);
    }
  };

  window.toggleSocialFaq = function(btn) {
    const item = btn.closest('.faq-item');
    if (!item) return;
    const wasOpen = item.classList.contains('is-open');
    document.querySelectorAll('#social-slide-4 .faq-item').forEach(el => el.classList.remove('is-open'));
    if (!wasOpen) {
      item.classList.add('is-open');
    }
  };
}

// 1B1b. Room 08 Email Marketing & Campaigns Vertical Deck Navigation
function initEmailDeck() {
  const track = document.getElementById('email-deck-track');
  const btnUp = document.getElementById('email-step-up');
  const btnDown = document.getElementById('email-step-down');

  window.glideToEmailSlide = function(index) {
    const bounded = Math.max(0, Math.min(index, TOTAL_EMAIL_SLIDES - 1));
    currentEmailSlide = bounded;

    if (track) {
      track.style.transform = `translate3d(0, ${-currentEmailSlide * 100}%, 0)`;
    }

    const pills = document.querySelectorAll('#email-stepper-dock .v-step-pill');
    pills.forEach((pill, idx) => {
      if (idx === currentEmailSlide) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    if (btnUp) btnUp.disabled = (currentEmailSlide === 0);
    if (btnDown) btnDown.disabled = (currentEmailSlide === TOTAL_EMAIL_SLIDES - 1);

    const targetSlide = document.getElementById(`email-slide-${currentEmailSlide}`);
    if (targetSlide) {
      targetSlide.scrollTop = 0;
    }
  };

  window.glideEmailNext = function() {
    if (currentEmailSlide < TOTAL_EMAIL_SLIDES - 1) {
      glideToEmailSlide(currentEmailSlide + 1);
    } else {
      glideToWall(8);
    }
  };

  window.glideEmailPrev = function() {
    if (currentEmailSlide > 0) {
      glideToEmailSlide(currentEmailSlide - 1);
    } else {
      glideToWall(6);
    }
  };

  window.toggleEmailFaq = function(btn) {
    const item = btn.closest('.faq-item');
    if (!item) return;
    const wasOpen = item.classList.contains('is-open');
    document.querySelectorAll('#email-slide-4 .faq-item').forEach(el => el.classList.remove('is-open'));
    if (!wasOpen) {
      item.classList.add('is-open');
    }
  };
}

// 1B1c. Room 09 Photography & Videography Vertical Deck Navigation
function initPhotoDeck() {
  const track = document.getElementById('photo-deck-track');
  const btnUp = document.getElementById('photo-step-up');
  const btnDown = document.getElementById('photo-step-down');

  window.glideToPhotoSlide = function(index) {
    const bounded = Math.max(0, Math.min(index, TOTAL_PHOTO_SLIDES - 1));
    currentPhotoSlide = bounded;

    if (track) {
      track.style.transform = `translate3d(0, ${-currentPhotoSlide * 100}%, 0)`;
    }

    const pills = document.querySelectorAll('#photo-stepper-dock .v-step-pill');
    pills.forEach((pill, idx) => {
      if (idx === currentPhotoSlide) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    if (btnUp) btnUp.disabled = (currentPhotoSlide === 0);
    if (btnDown) btnDown.disabled = (currentPhotoSlide === TOTAL_PHOTO_SLIDES - 1);

    const targetSlide = document.getElementById(`photo-slide-${currentPhotoSlide}`);
    if (targetSlide) {
      targetSlide.scrollTop = 0;
    }
  };

  window.glidePhotoNext = function() {
    if (currentPhotoSlide < TOTAL_PHOTO_SLIDES - 1) {
      glideToPhotoSlide(currentPhotoSlide + 1);
    } else {
      glideToWall(9);
    }
  };

  window.glidePhotoPrev = function() {
    if (currentPhotoSlide > 0) {
      glideToPhotoSlide(currentPhotoSlide - 1);
    } else {
      glideToWall(7);
    }
  };

  window.togglePhotoFaq = function(btn) {
    const item = btn.closest('.faq-item');
    if (!item) return;
    const wasOpen = item.classList.contains('is-open');
    document.querySelectorAll('#photo-slide-4 .faq-item').forEach(el => el.classList.remove('is-open'));
    if (!wasOpen) {
      item.classList.add('is-open');
    }
  };
}

// 1B1d. Room 10 App Development with UI & UX Vertical Deck Navigation
function initAppDeck() {
  const track = document.getElementById('app-deck-track');
  const btnUp = document.getElementById('app-step-up');
  const btnDown = document.getElementById('app-step-down');

  window.glideToAppSlide = function(index) {
    const bounded = Math.max(0, Math.min(index, TOTAL_APP_SLIDES - 1));
    currentAppSlide = bounded;

    if (track) {
      track.style.transform = `translate3d(0, ${-currentAppSlide * 100}%, 0)`;
    }

    const pills = document.querySelectorAll('#app-stepper-dock .v-step-pill');
    pills.forEach((pill, idx) => {
      if (idx === currentAppSlide) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    if (btnUp) btnUp.disabled = (currentAppSlide === 0);
    if (btnDown) btnDown.disabled = (currentAppSlide === TOTAL_APP_SLIDES - 1);

    const targetSlide = document.getElementById(`app-slide-${currentAppSlide}`);
    if (targetSlide) {
      targetSlide.scrollTop = 0;
    }
  };

  window.glideAppNext = function() {
    if (currentAppSlide < TOTAL_APP_SLIDES - 1) {
      glideToAppSlide(currentAppSlide + 1);
    } else {
      glideToWall(10);
    }
  };

  window.glideAppPrev = function() {
    if (currentAppSlide > 0) {
      glideToAppSlide(currentAppSlide - 1);
    } else {
      glideToWall(8);
    }
  };

  window.toggleAppFaq = function(btn) {
    const item = btn.closest('.faq-item');
    if (!item) return;
    const wasOpen = item.classList.contains('is-open');
    document.querySelectorAll('#app-slide-4 .faq-item').forEach(el => el.classList.remove('is-open'));
    if (!wasOpen) {
      item.classList.add('is-open');
    }
  };
}

// 1B2. Room 04 Proven Impact Vertical Deck Navigation
function initImpactDeck() {
  const track = document.getElementById('impact-deck-track');
  const btnUp = document.getElementById('impact-step-up');
  const btnDown = document.getElementById('impact-step-down');

  window.glideToImpactSlide = function(index) {
    const bounded = Math.max(0, Math.min(index, TOTAL_IMPACT_SLIDES - 1));
    currentImpactSlide = bounded;

    if (track) {
      track.style.transform = `translate3d(0, ${-currentImpactSlide * 100}%, 0)`;
    }

    const pills = document.querySelectorAll('#impact-stepper-dock .v-step-pill');
    pills.forEach((pill, idx) => {
      if (idx === currentImpactSlide) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    if (btnUp) btnUp.disabled = (currentImpactSlide === 0);
    if (btnDown) btnDown.disabled = (currentImpactSlide === TOTAL_IMPACT_SLIDES - 1);

    const vAratt = document.getElementById('impact-fullscreen-aratt');
    const vSample = document.getElementById('impact-fullscreen-sample');
    if (vAratt) {
      if (currentImpactSlide === 1) {
        vAratt.play().catch(() => {});
      } else {
        vAratt.pause();
      }
    }
    if (vSample) {
      if (currentImpactSlide === 2) {
        vSample.play().catch(() => {});
      } else {
        vSample.pause();
      }
    }
  };

  window.glideImpactNext = function() {
    if (currentImpactSlide < TOTAL_IMPACT_SLIDES - 1) {
      glideToImpactSlide(currentImpactSlide + 1);
    } else {
      glideToWall(4);
    }
  };

  window.glideImpactPrev = function() {
    if (currentImpactSlide > 0) {
      glideToImpactSlide(currentImpactSlide - 1);
    } else {
      glideToWall(2);
    }
  };
}

// 1B3. Room 03 Web Design Vertical Deck Navigation
function initWebDesignDeck() {
  const track = document.getElementById('webdesign-deck-track');
  const btnUp = document.getElementById('wd-step-up');
  const btnDown = document.getElementById('wd-step-down');

  window.glideToWebDesignSlide = function(index) {
    const bounded = Math.max(0, Math.min(index, TOTAL_WEBDESIGN_SLIDES - 1));
    currentWebDesignSlide = bounded;

    if (track) {
      track.style.transform = `translate3d(0, ${-currentWebDesignSlide * 100}%, 0)`;
    }

    const pills = document.querySelectorAll('#wd-stepper-dock .v-step-pill');
    pills.forEach((pill, idx) => {
      if (idx === currentWebDesignSlide) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    if (btnUp) btnUp.disabled = (currentWebDesignSlide === 0);
    if (btnDown) btnDown.disabled = (currentWebDesignSlide === TOTAL_WEBDESIGN_SLIDES - 1);

    const targetSlide = document.getElementById(`wd-slide-${currentWebDesignSlide}`);
    if (targetSlide) {
      targetSlide.scrollTop = 0;
    }
  };

  window.glideWebDesignNext = function() {
    if (currentWebDesignSlide < TOTAL_WEBDESIGN_SLIDES - 1) {
      glideToWebDesignSlide(currentWebDesignSlide + 1);
    } else {
      glideToWall(3);
    }
  };

  window.glideWebDesignPrev = function() {
    if (currentWebDesignSlide > 0) {
      glideToWebDesignSlide(currentWebDesignSlide - 1);
    } else {
      glideToWall(1);
    }
  };

  window.toggleWdFaq = function(btn) {
    const item = btn.closest('.faq-item');
    if (!item) return;
    const wasOpen = item.classList.contains('is-open');
    document.querySelectorAll('#wd-slide-4 .faq-item').forEach(el => el.classList.remove('is-open'));
    if (!wasOpen) {
      item.classList.add('is-open');
    }
  };
}

// 1C. Room 06 Contact Us Form Handler
window.handleContactSubmit = async function(event) {
  event.preventDefault();
  const btn = document.getElementById('btn-submit-contact');
  const feedback = document.getElementById('contact-form-feedback');
  const name = document.getElementById('contact-name')?.value || 'Client';
  const phone = document.getElementById('contact-phone')?.value || '';
  const idea = document.getElementById('contact-idea')?.value || '';
  const vibe = document.getElementById('contact-vibe')?.value || '';
  const goal = document.getElementById('contact-goal')?.value || '';
  const competition = document.getElementById('contact-competition')?.value || '';

  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Submitting...';
  }

  try {
    await fetch('/api/flick/booking/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slotId: 1,
        clientName: name,
        phone: phone,
        serviceInterested: 'Creative Project Briefing',
        notes: `Idea: ${idea} | Vibe: ${vibe} | Goal: ${goal} | Competition: ${competition}`
      })
    });
  } catch (err) {
    console.warn('Inquiry registered client-side:', err);
  }

  if (btn) {
    btn.textContent = 'Submitted ✓';
    btn.style.background = '#10b981';
    btn.style.borderColor = '#10b981';
    btn.style.color = '#ffffff';
  }

  if (feedback) {
    feedback.style.display = 'block';
    feedback.innerHTML = `⚡ Thank you, <strong>${escapeHtml(name)}</strong>! We've received your vibe & goals. Our creative team will reach out via WhatsApp shortly.`;
  }
};

// 2. Full-Screen Minimalist Drawer Menu
function initDrawerMenu() {
  const btn = document.getElementById('hamburger-menu-btn');
  if (btn) {
    btn.addEventListener('click', () => toggleDrawer(true));
  }
}

window.toggleDrawer = function(forceState = null) {
  const drawer = document.getElementById('full-screen-drawer');
  if (!drawer) return;

  const isOpen = drawer.classList.contains('open');
  const shouldOpen = forceState !== null ? forceState : !isOpen;

  if (shouldOpen) {
    drawer.classList.add('open');
    document.body.classList.add('drawer-open');
  } else {
    drawer.classList.remove('open');
    document.body.classList.remove('drawer-open');
  }
};

// 3. Live Studio Slots Engine (In-RAM SQLite + SSE)
async function initLiveSlots() {
  const container = document.getElementById('corridor-slots-grid');
  const counter = document.getElementById('corridor-slot-counter');
  if (!container) return;

  try {
    const res = await fetch('/api/flick/booking/slots');
    const data = await res.json();

    if (data.success && data.slots) {
      const availableCount = data.slots.filter(s => s.status === 'AVAILABLE').length;
      if (counter) {
        counter.textContent = `⚡ ${availableCount} Slots Available Today & Tomorrow`;
      }

      container.innerHTML = data.slots.map(slot => {
        const isAvail = slot.status === 'AVAILABLE';
        return `
          <div class="slot-ticket-card ${isAvail ? 'available' : 'reserved'}">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <span style="font-size: 0.72rem; font-weight: 800; padding: 3px 8px; border-radius: 20px; text-transform: uppercase; ${isAvail ? 'background: rgba(16,185,129,0.15); color: #34d399; border: 1px solid #10b981;' : 'background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid #ef4444;'}">
                  ${isAvail ? '● Open For Booking' : '✕ Reserved'}
                </span>
                <span style="font-family: var(--font-mono); font-size: 0.75rem; color: #64748b;">#SLOT-0${slot.id}</span>
              </div>

              <div style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">
                ${escapeHtml(slot.slot_time)}
              </div>
              <div style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 10px; font-weight: 500;">
                ${escapeHtml(slot.slot_type)}
              </div>
              <div style="font-size: 0.78rem; color: var(--text-dim); margin-bottom: 18px;">
                📍 ${escapeHtml(slot.location)}
              </div>
            </div>

            <div>
              ${isAvail ? `
                <button class="btn-gold" style="width: 100%; padding: 10px; font-size: 0.85rem;" onclick="openBookingModal(${slot.id}, '${escapeJs(slot.slot_time)}', '${escapeJs(slot.slot_type)}')">
                  Reserve This Session ➔
                </button>
              ` : `
                <div style="font-size: 0.8rem; color: var(--text-secondary); text-align: center;">
                  Reserved by <strong>${escapeHtml(slot.booked_by || 'Client')}</strong>
                  ${slot.confirmation_code ? `<br><span style="color: var(--accent-primary); font-family: var(--font-mono); font-weight: 700;">#${escapeHtml(slot.confirmation_code)}</span>` : ''}
                </div>
              `}
            </div>
          </div>
        `;
      }).join('');
    }
  } catch (err) {
    console.error('Failed to load slots:', err);
    container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #94a3b8;">Call +971 56 189 2990 directly for studio availability.</div>';
  }
}

// 4. Server-Sent Events (SSE) Synchronization
function initSSEListener() {
  if (!window.EventSource) return;

  const es = new EventSource('/api/flick/events');
  es.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.event === 'SLOT_BOOKED' || data.event === 'SLOT_CANCELLED') {
        console.log('⚡ Real-time studio state update received:', data);
        initLiveSlots();
        initAgentTerminal();
      }
    } catch (e) {}
  };
}

// 5. Booking Modal Flow
function initBookingModal() {
  const form = document.getElementById('slot-booking-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-submit-booking');
    const origText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = 'Securing Session...';

    const name = document.getElementById('client-name').value.trim();
    const phone = document.getElementById('client-phone').value.trim();
    const service = document.getElementById('client-service').value;

    try {
      const res = await fetch('/api/flick/booking/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: activeBookingSlotId,
          clientName: name,
          phone: phone,
          serviceInterested: service
        })
      });

      const result = await res.json();

      if (result.success) {
        showReceipt(result);
        initLiveSlots();
      } else {
        alert(result.error || 'Could not reserve slot.');
        btn.disabled = false;
        btn.innerHTML = origText;
      }
    } catch (err) {
      alert('Network error. Please call +971 56 189 2990 directly.');
      btn.disabled = false;
      btn.innerHTML = origText;
    }
  });
}

window.openBookingModal = function(slotId, time, type) {
  activeBookingSlotId = slotId;
  const overlay = document.getElementById('booking-modal-overlay');
  const title = document.getElementById('modal-slot-title');
  const timeLabel = document.getElementById('modal-slot-time');

  if (title) title.textContent = `Reserve ${type}`;
  if (timeLabel) timeLabel.textContent = `Target Slot: ${time} • Level 14, The Burlington Tower, Business Bay`;

  document.getElementById('modal-form-view').style.display = 'block';
  document.getElementById('modal-receipt-view').style.display = 'none';

  overlay.classList.add('active');
};

window.closeBookingModal = function() {
  const overlay = document.getElementById('booking-modal-overlay');
  if (overlay) overlay.classList.remove('active');
};

function showReceipt(result) {
  document.getElementById('modal-form-view').style.display = 'none';
  const receiptView = document.getElementById('modal-receipt-view');
  receiptView.style.display = 'block';

  document.getElementById('receipt-code-val').textContent = `#${result.confirmationCode}`;
  document.getElementById('receipt-details-val').innerHTML = `
    <div>👤 <strong>Client:</strong> ${escapeHtml(result.clientName)}</div>
    <div>🗓️ <strong>Session:</strong> ${escapeHtml(result.slotType)}</div>
    <div>⏰ <strong>Time:</strong> ${escapeHtml(result.slotTime)}</div>
    <div>📍 <strong>Location:</strong> Level 14, The Burlington Tower, Business Bay, Dubai</div>
    <div>📞 <strong>Host Line:</strong> +971 56 189 2990</div>
  `;
}

// 6. Agent Terminal Inspector
async function initAgentTerminal() {
  const display = document.getElementById('corridor-terminal-output');
  if (!display) return;

  try {
    const res = await fetch('/api/flick/agent/availability');
    const data = await res.json();
    display.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    display.textContent = '// Failed to fetch live availability';
  }
}

window.copyTerminalJson = function() {
  const display = document.getElementById('corridor-terminal-output');
  if (display) {
    navigator.clipboard.writeText(display.textContent);
    alert('Agent JSON copied to clipboard! ✓');
  }
};

// Utilities
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

function escapeJs(str) {
  if (!str) return '';
  return String(str).replace(/['\\]/g, '\\$&');
}

// ============================================================================
// 6C. INTERACTIVE FLICK LOGO FLUID WAVE HOVER ENGINE
// Undulates the letters like waves when the mouse hovers or moves across it
// ============================================================================
function initFlickLogoWave() {
  const brandElements = document.querySelectorAll('.nav-brand, .drawer-flick-logo');
  brandElements.forEach(brand => {
    const letters = brand.querySelectorAll('.wave-letter');
    if (!letters.length) return;

    brand.addEventListener('mousemove', (e) => {
      const rect = brand.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;

      letters.forEach((letter) => {
        const letterRect = letter.getBoundingClientRect();
        const letterCenter = letterRect.left + letterRect.width / 2 - rect.left;
        const dist = Math.abs(mouseX - letterCenter);
        const maxDist = 70;
        if (dist < maxDist) {
          const waveHeight = Math.cos((dist / maxDist) * (Math.PI / 2)) * 11;
          letter.style.transform = `translateY(${-waveHeight}px) scale(${1 + waveHeight * 0.012})`;
        } else {
          letter.style.transform = '';
        }
      });
    });

    brand.addEventListener('mouseleave', () => {
      letters.forEach(letter => {
        letter.style.transform = '';
      });
    });
  });
}

// ============================================================================
// 7. THEME TOGGLE ENGINE (Studio Dark Mode & Gallery Light Mode)
// ============================================================================
function initThemeToggle() {
  const headerBtn = document.getElementById('theme-toggle-btn');
  const drawerBtn = document.getElementById('drawer-theme-toggle-btn');

  // Retrieve saved preference or default to dark
  const savedTheme = localStorage.getItem('flick_theme') || 'dark';
  applyTheme(savedTheme);

  function applyTheme(theme) {
    if (theme === 'light') {
      document.body.classList.add('theme-light');
      document.body.classList.remove('theme-dark');
      updateThemeControls('light');
    } else {
      document.body.classList.add('theme-dark');
      document.body.classList.remove('theme-light');
      updateThemeControls('dark');
    }
  }

  function updateThemeControls(theme) {
    const isLight = theme === 'light';
    const nextIcon = isLight ? '🌙' : '☀️';
    const nextLabel = isLight ? 'DARK' : 'LIGHT';
    const drawerLabel = isLight ? 'DARK MODE' : 'LIGHT MODE';

    const headerIcon = document.getElementById('theme-toggle-icon');
    const headerText = document.getElementById('theme-toggle-text');
    const drawerIcon = document.getElementById('drawer-theme-icon');
    const drawerText = document.getElementById('drawer-theme-text');

    if (headerIcon) headerIcon.textContent = nextIcon;
    if (headerText) headerText.textContent = nextLabel;
    if (drawerIcon) drawerIcon.textContent = nextIcon;
    if (drawerText) drawerText.textContent = drawerLabel;
  }

  window.toggleTheme = function() {
    const isCurrentLight = document.body.classList.contains('theme-light');
    const nextTheme = isCurrentLight ? 'dark' : 'light';
    applyTheme(nextTheme);
    localStorage.setItem('flick_theme', nextTheme);
  };

  if (headerBtn) {
    headerBtn.addEventListener('click', window.toggleTheme);
  }
  if (drawerBtn) {
    drawerBtn.addEventListener('click', window.toggleTheme);
  }
}

// ============================================================================
// 8. 3D LEVITATING SAPPHIRE DIAMOND ENGINE (Real-Time Geometric Polyhedron)
// ============================================================================
function initRotatingDiamond() {
  const canvas = document.getElementById('sculpture-diamond-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const card = document.getElementById('sculpture-window-card');

  // Internal resolution
  const W = canvas.width;
  const H = canvas.height;
  const cx = W / 2;
  const cy = H / 2;

  // 32-Facet Diamond Polyhedron: 18 Vertices
  const N = 8;
  const R = 58; // radius
  const H_apex = R * 1.28;
  const H_band = R * 0.38;

  const baseVertices = [];
  // 0: Top Apex
  baseVertices.push({ x: 0, y: -H_apex, z: 0 });

  // 1-8: Upper Girdle Ring
  for (let i = 0; i < N; i++) {
    const a = (i * Math.PI * 2) / N;
    baseVertices.push({
      x: R * Math.cos(a),
      y: -H_band,
      z: R * Math.sin(a)
    });
  }

  // 9-16: Lower Girdle Ring (staggered by 22.5 deg)
  for (let i = 0; i < N; i++) {
    const a = ((i + 0.5) * Math.PI * 2) / N;
    baseVertices.push({
      x: R * Math.cos(a),
      y: H_band,
      z: R * Math.sin(a)
    });
  }

  // 17: Bottom Apex
  baseVertices.push({ x: 0, y: H_apex, z: 0 });

  // 32 Triangular Facets
  const faces = [];
  // Top Crown (8 triangles)
  for (let i = 0; i < N; i++) {
    faces.push([0, 1 + i, 1 + ((i + 1) % N)]);
  }
  // Middle Pavilion Belt (16 triangles alternating)
  for (let i = 0; i < N; i++) {
    const u1 = 1 + i;
    const u2 = 1 + ((i + 1) % N);
    const l1 = 1 + N + i;
    const l2 = 1 + N + ((i + 1) % N);
    faces.push([u1, l1, u2]);
    faces.push([l1, l2, u2]);
  }
  // Bottom Pavilion (8 triangles)
  for (let i = 0; i < N; i++) {
    faces.push([17, 1 + N + ((i + 1) % N), 1 + N + i]);
  }

  let rotY = 0;
  let targetSpeed = 0.016;
  let currentSpeed = 0.016;
  let tiltX = 0.12; // slight downward view showing upper facets
  let targetTiltX = 0.12;
  let tiltZ = 0;
  let targetTiltZ = 0;

  // Interactive mouse tilt & speed boost
  if (card) {
    card.addEventListener('mouseenter', () => {
      targetSpeed = 0.032;
    });
    card.addEventListener('mouseleave', () => {
      targetSpeed = 0.016;
      targetTiltX = 0.12;
      targetTiltZ = 0;
    });
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      targetTiltX = 0.12 + ny * 0.15;
      targetTiltZ = -nx * 0.12;
    });
  }

  // Directional Key Light for Specular Calculation
  const lightDir = { x: 0.45, y: -0.75, z: 0.65 };
  const lMag = Math.hypot(lightDir.x, lightDir.y, lightDir.z);
  lightDir.x /= lMag;
  lightDir.y /= lMag;
  lightDir.z /= lMag;

  function renderDiamond(time) {
    // Only render when Room 0 or 1 is nearby
    if (typeof currentWallIndex !== 'undefined' && currentWallIndex > 1) {
      setTimeout(() => requestAnimationFrame(renderDiamond), 250);
      return;
    }

    currentSpeed += (targetSpeed - currentSpeed) * 0.08;
    tiltX += (targetTiltX - tiltX) * 0.08;
    tiltZ += (targetTiltZ - tiltZ) * 0.08;
    rotY += currentSpeed;

    // Gentle anti-gravity levitation float
    const floatY = Math.sin(time * 0.0022) * 3.5;

    ctx.clearRect(0, 0, W, H);

    // 1. Theme-Adaptive Aperture Void (Covers static diamond seamlessly in dark & light)
    const isLight = document.body.classList.contains('theme-light');
    const voidRadius = W * 0.44;
    const bgVoid = ctx.createRadialGradient(cx, cy, 0, cx, cy, voidRadius);
    if (isLight) {
      bgVoid.addColorStop(0, '#f0f0f0');
      bgVoid.addColorStop(0.55, '#f5f5f5');
      bgVoid.addColorStop(0.8, 'rgba(245, 245, 245, 0.96)');
      bgVoid.addColorStop(1, 'rgba(245, 245, 245, 0)');
    } else {
      bgVoid.addColorStop(0, '#030509');
      bgVoid.addColorStop(0.55, '#050812');
      bgVoid.addColorStop(0.8, 'rgba(5, 8, 18, 0.96)');
      bgVoid.addColorStop(1, 'rgba(5, 8, 18, 0)');
    }
    ctx.fillStyle = bgVoid;
    ctx.beginPath();
    ctx.arc(cx, cy, voidRadius, 0, Math.PI * 2);
    ctx.fill();

    // 2. Ambient Sapphire Magnetic Aura
    const aura = ctx.createRadialGradient(cx, cy + floatY, 8, cx, cy + floatY, W * 0.38);
    aura.addColorStop(0, 'rgba(59, 130, 246, 0.42)');
    aura.addColorStop(0.5, 'rgba(29, 78, 216, 0.18)');
    aura.addColorStop(1, 'transparent');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(cx, cy + floatY, W * 0.38, 0, Math.PI * 2);
    ctx.fill();

    // 3. 3D Rotation Matrix Calculation
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const cosX = Math.cos(tiltX);
    const sinX = Math.sin(tiltX);
    const cosZ = Math.cos(tiltZ);
    const sinZ = Math.sin(tiltZ);

    const transformed = baseVertices.map(v => {
      // Y-axis spin
      let x1 = v.x * cosY + v.z * sinY;
      let y1 = v.y;
      let z1 = -v.x * sinY + v.z * cosY;

      // X-axis tilt
      let x2 = x1;
      let y2 = y1 * cosX - z1 * sinX;
      let z2 = y1 * sinX + z1 * cosX;

      // Z-axis interactive roll
      let x3 = x2 * cosZ - y2 * sinZ;
      let y3 = x2 * sinZ + y2 * cosZ;
      let z3 = z2;

      // Perspective Projection
      const fov = 420;
      const scale = fov / (fov + z3);
      return {
        x: cx + x3 * scale,
        y: cy + (y3 + floatY) * scale,
        z: z3,
        rawX: x3, rawY: y3, rawZ: z3
      };
    });

    // 4. Face Normal & Lighting Analysis
    const faceData = faces.map(face => {
      const v0 = transformed[face[0]];
      const v1 = transformed[face[1]];
      const v2 = transformed[face[2]];

      const ax = v1.rawX - v0.rawX;
      const ay = v1.rawY - v0.rawY;
      const az = v1.rawZ - v0.rawZ;
      const bx = v2.rawX - v0.rawX;
      const by = v2.rawY - v0.rawY;
      const bz = v2.rawZ - v0.rawZ;

      let nx = ay * bz - az * by;
      let ny = az * bx - ax * bz;
      let nz = ax * by - ay * bx;
      const nLen = Math.hypot(nx, ny, nz) || 1;
      nx /= nLen; ny /= nLen; nz /= nLen;

      const avgZ = (v0.z + v1.z + v2.z) / 3;
      const isFront = nz > 0;
      const dotLight = Math.max(0, nx * lightDir.x + ny * lightDir.y + nz * lightDir.z);

      return { face, v0, v1, v2, avgZ, isFront, dotLight, nx, ny, nz };
    });

    // Sort Back-to-Front for accurate optical depth
    faceData.sort((a, b) => a.avgZ - b.avgZ);

    // 5. Pass 1: Render Back Faces (Glass Transparency & Refraction)
    faceData.filter(f => !f.isFront).forEach(f => {
      ctx.beginPath();
      ctx.moveTo(f.v0.x, f.v0.y);
      ctx.lineTo(f.v1.x, f.v1.y);
      ctx.lineTo(f.v2.x, f.v2.y);
      ctx.closePath();
      ctx.fillStyle = 'rgba(15, 30, 95, 0.4)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // 6. Internal Luminous Energy Core
    const coreGrad = ctx.createRadialGradient(cx, cy + floatY, 2, cx, cy + floatY, 32);
    coreGrad.addColorStop(0, 'rgba(224, 242, 254, 0.92)');
    coreGrad.addColorStop(0.35, 'rgba(56, 189, 248, 0.7)');
    coreGrad.addColorStop(0.7, 'rgba(37, 99, 235, 0.4)');
    coreGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy + floatY, 32, 0, Math.PI * 2);
    ctx.fill();

    // 7. Pass 2: Render Front Faces (Brilliant Sapphire Facets)
    faceData.filter(f => f.isFront).forEach(f => {
      ctx.beginPath();
      ctx.moveTo(f.v0.x, f.v0.y);
      ctx.lineTo(f.v1.x, f.v1.y);
      ctx.lineTo(f.v2.x, f.v2.y);
      ctx.closePath();

      // Dual-tone Sapphire Shading
      const lum = Math.floor(190 + f.dotLight * 65);
      const alpha = 0.72 + f.dotLight * 0.24;

      const grad = ctx.createLinearGradient(f.v0.x, f.v0.y, f.v2.x, f.v2.y);
      if (f.dotLight > 0.58) {
        grad.addColorStop(0, `rgba(${lum}, 235, 255, ${alpha})`);
        grad.addColorStop(0.6, `rgba(59, 130, 246, ${alpha})`);
        grad.addColorStop(1, `rgba(29, 78, 216, ${alpha})`);
      } else {
        grad.addColorStop(0, `rgba(37, 99, 235, ${alpha})`);
        grad.addColorStop(1, `rgba(15, 30, 100, ${alpha})`);
      }

      ctx.fillStyle = grad;
      ctx.fill();

      // Crisp Luminescent Edges
      ctx.strokeStyle = f.dotLight > 0.55 ? 'rgba(255, 255, 255, 0.95)' : 'rgba(147, 197, 253, 0.8)';
      ctx.lineWidth = f.dotLight > 0.55 ? 1.6 : 1.1;
      ctx.stroke();
    });

    // 8. Pass 3: Radiant Star Glints on High Specular Peaks
    faceData.filter(f => f.isFront && f.dotLight > 0.76).forEach(f => {
      drawStarSparkle(ctx, f.v1.x, f.v1.y, 5, 0.95);
    });

    requestAnimationFrame(renderDiamond);
  }

  function drawStarSparkle(c, x, y, r, alpha) {
    c.save();
    c.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
    c.lineWidth = 1.3;
    c.shadowColor = '#60a5fa';
    c.shadowBlur = 8;
    c.beginPath();
    c.moveTo(x - r, y); c.lineTo(x + r, y);
    c.moveTo(x, y - r); c.lineTo(x, y + r);
    c.stroke();
    c.restore();
  }

  requestAnimationFrame(renderDiamond);
}

// ============================================================================
// 8. EXHIBIT #02 DETACHED DRAGGABLE VIDEO SHOWCASE (Sample Video Player)
// ============================================================================
// 8. EXHIBIT #02 DETACHED DRAGGABLE VIDEO SHOWCASE (Sample Video Player)
// - Starts docked as a bottom-right floating pill (zero hero manifesto overlap)
// - Expands smoothly into full floating draggable player on click
// - Minimize button collapses it cleanly back into dock pill
// - Drag header allows moving anywhere across the viewport (strictly bounded)
// - Frame click toggles play/pause cleanly (voice button removed)
// ============================================================================
function initVideoKiosk() {
  const kiosk = document.getElementById('flick-video-kiosk');
  const video = document.getElementById('flick-kiosk-video');
  const dockPill = document.getElementById('flick-reel-dock-pill');
  const minimizeBtn = document.getElementById('btn-video-minimize');
  const resetBtn = document.getElementById('btn-video-reset');
  const frame = document.getElementById('video-kiosk-frame') || document.querySelector('.video-kiosk-frame');

  if (!kiosk || !video) return;

  // 1. Continuous Video Playback (Muted Autoplay Defense)
  video.muted = true;
  video.play().catch(() => {
    video.muted = true;
    video.play().catch(e => console.warn('Autoplay prevented:', e));
  });

  // 2. Expand & Minimize Handlers
  function expandKiosk() {
    if (!kiosk.style.left || kiosk.style.left === 'auto') {
      const def = getDefaultPosition();
      setKioskPosition(def.x, def.y, false);
    }
    kiosk.classList.remove('is-collapsed');
    kiosk.classList.add('is-expanded');
    if (dockPill) dockPill.classList.add('is-hidden');
    if (video.paused) {
      video.play().catch(() => {});
    }
  }

  function minimizeKiosk(e) {
    if (e && e.stopPropagation) e.stopPropagation();
    kiosk.classList.add('is-collapsed');
    kiosk.classList.remove('is-expanded');
    if (dockPill) dockPill.classList.remove('is-hidden');
  }

  if (dockPill) {
    dockPill.addEventListener('click', (e) => {
      e.stopPropagation();
      expandKiosk();
    });
  }

  if (minimizeBtn) {
    minimizeBtn.addEventListener('click', minimizeKiosk);
  }

  // 3. Draggable Engine with Strict Boundary Protection
  let isPointerDown = false;
  let hasDragged = false;
  let startPointerX = 0;
  let startPointerY = 0;
  let elemStartLeft = 0;
  let elemStartTop = 0;
  const DRAG_THRESHOLD = 5; // Pixels to distinguish click from drag
  const PADDING = 12; // Minimum distance from page edges

  function clampPosition(left, top) {
    const width = kiosk.offsetWidth || 290;
    const height = kiosk.offsetHeight || 195;
    const minX = PADDING;
    const maxX = Math.max(PADDING, window.innerWidth - width - PADDING);
    const minY = PADDING;
    const maxY = Math.max(PADDING, window.innerHeight - height - 72);

    return {
      x: Math.max(minX, Math.min(left, maxX)),
      y: Math.max(minY, Math.min(top, maxY))
    };
  }

  function setKioskPosition(x, y, animate = false) {
    if (animate) {
      kiosk.style.transition = 'left 0.4s cubic-bezier(0.16, 1, 0.3, 1), top 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      setTimeout(() => {
        kiosk.style.transition = '';
      }, 420);
    } else {
      kiosk.style.transition = '';
    }
    kiosk.style.left = `${Math.round(x)}px`;
    kiosk.style.top = `${Math.round(y)}px`;
    kiosk.style.bottom = 'auto';
    kiosk.style.right = 'auto';
  }

  function getDefaultPosition() {
    const width = kiosk.offsetWidth || 290;
    const height = kiosk.offsetHeight || 195;
    const targetX = window.innerWidth - width - 28;
    const targetY = window.innerHeight - height - 80;
    return clampPosition(targetX, targetY);
  }

  function resetToDefaultPosition() {
    const def = getDefaultPosition();
    setKioskPosition(def.x, def.y, true);
  }

  // Initialize position on layout ready (bottom-right above reel dock)
  setTimeout(() => {
    const def = getDefaultPosition();
    setKioskPosition(def.x, def.y, false);
  }, 60);

  // Resize listener: keep widget strictly inside viewport
  window.addEventListener('resize', () => {
    const rect = kiosk.getBoundingClientRect();
    const clamped = clampPosition(rect.left, rect.top);
    setKioskPosition(clamped.x, clamped.y, false);
  });

  // Reset button action
  if (resetBtn) {
    resetBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      resetToDefaultPosition();
    });
  }

  // Pointer Drag handling (Supports Mouse & Touch)
  kiosk.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    if (e.target.closest('button')) return;

    isPointerDown = true;
    hasDragged = false;
    startPointerX = e.clientX;
    startPointerY = e.clientY;

    const rect = kiosk.getBoundingClientRect();
    elemStartLeft = rect.left;
    elemStartTop = rect.top;

    try {
      kiosk.setPointerCapture(e.pointerId);
    } catch (_) {}
  });

  kiosk.addEventListener('pointermove', (e) => {
    if (!isPointerDown) return;
    e.stopPropagation();

    const dx = e.clientX - startPointerX;
    const dy = e.clientY - startPointerY;

    if (!hasDragged && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
      hasDragged = true;
      kiosk.classList.add('is-dragging');
    }

    if (hasDragged) {
      const desiredX = elemStartLeft + dx;
      const desiredY = elemStartTop + dy;
      const clamped = clampPosition(desiredX, desiredY);
      setKioskPosition(clamped.x, clamped.y, false);
    }
  });

  function onPointerRelease(e) {
    if (!isPointerDown) return;
    e.stopPropagation();
    isPointerDown = false;

    try {
      kiosk.releasePointerCapture(e.pointerId);
    } catch (_) {}

    if (hasDragged) {
      kiosk.classList.remove('is-dragging');
      setTimeout(() => {
        hasDragged = false;
      }, 80);
    }
  }

  kiosk.addEventListener('pointerup', onPointerRelease);
  kiosk.addEventListener('pointercancel', onPointerRelease);

  // Complete Event Isolation: prevent video kiosk interactions from bubbling to backpage
  ['mousedown', 'mousemove', 'mouseup', 'touchstart', 'touchmove', 'touchend', 'wheel'].forEach(evt => {
    kiosk.addEventListener(evt, (e) => {
      e.stopPropagation();
    }, { passive: false });
  });

  // Frame click: if not dragged, toggle play/pause cleanly
  if (frame) {
    frame.addEventListener('click', (e) => {
      e.stopPropagation();
      if (hasDragged) return;
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    });
  }
}

// ============================================================================
// 8B. ROOM 04: PORTFOLIO 3-FRAME BORDERLESS VIDEO SHOWCASE
// - 3 borderless video frames running continuously side-by-side
// - Autoplay muted defense with staggered loop offsets for dynamic variety
// - Clean click toggle play/pause
// ============================================================================
function initPortfolioVideos() {
  const videos = document.querySelectorAll('.portfolio-video-player');
  if (!videos || !videos.length) return;

  const offsets = [0, 3.8, 7.6]; // Stagger playback start moments

  videos.forEach((vid, index) => {
    vid.muted = true;
    vid.playsInline = true;
    vid.preload = 'none';

    vid.addEventListener('loadedmetadata', () => {
      if (offsets[index]) {
        try { vid.currentTime = offsets[index]; } catch (_) {}
      }
    }, { once: true });

    vid.addEventListener('click', () => {
      if (vid.paused) {
        vid.play().catch(() => {});
      } else {
        vid.pause();
      }
    });
  });

  // Media Deferred Loading Engine: Only stream video buffer when Room 04 enters viewport
  const wall3 = document.getElementById('wall-3');
  if (wall3 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          videos.forEach(vid => {
            if (vid.paused) vid.play().catch(() => {});
          });
        } else {
          videos.forEach(vid => {
            if (!vid.paused) vid.pause();
          });
        }
      });
    }, { threshold: 0.15 });

    observer.observe(wall3);
  }
}

// ============================================================================
// 9. AUTO-HIDE WINDOWS-STYLE TASKBAR NAVIGATION HUD
// Retracts down below the viewport when inactive.
// Smoothly slides back up when the mouse hovers or moves near the bottom edge.
// ============================================================================
function initAutoHideTaskbar() {
  const bar = document.getElementById('bottom-hud-bar');
  if (!bar) return;

  let hideTimeout = null;
  let isPointerOverBar = false;

  function showBar() {
    clearTimeout(hideTimeout);
    bar.classList.add('is-visible');
  }

  function scheduleHide(delay = 400) {
    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => {
      if (!isPointerOverBar) {
        bar.classList.remove('is-visible');
      }
    }, delay);
  }

  // 1. Initial Page Load Presentation:
  // Show taskbar on load for 2.6s to orient visitor, then smoothly retract
  showBar();
  scheduleHide(2600);

  // 2. Mouse Proximity Detection:
  // When cursor is within 65px of the bottom viewport edge, reveal taskbar
  window.addEventListener('mousemove', (e) => {
    const distFromBottom = window.innerHeight - e.clientY;
    if (distFromBottom <= 65) {
      showBar();
    } else if (!isPointerOverBar) {
      scheduleHide(380);
    }
  }, { passive: true });

  // 3. Direct Pointer Hover on HUD Bar
  bar.addEventListener('mouseenter', () => {
    isPointerOverBar = true;
    showBar();
  });

  bar.addEventListener('mouseleave', () => {
    isPointerOverBar = false;
    scheduleHide(380);
  });

  // 4. Accessibility Keyboard Focus
  bar.addEventListener('focusin', () => {
    showBar();
  });

  bar.addEventListener('focusout', (e) => {
    if (!bar.contains(e.relatedTarget)) {
      scheduleHide(450);
    }
  });

  // 5. Peek handle click/touch directly toggles taskbar
  const peekHandle = document.getElementById('hud-peek-handle');
  if (peekHandle) {
    function toggleHud(e) {
      e.stopPropagation();
      if (bar.classList.contains('is-visible')) {
        bar.classList.remove('is-visible');
      } else {
        showBar();
      }
    }
    peekHandle.addEventListener('click', toggleHud);
    peekHandle.addEventListener('touchend', (e) => {
      e.preventDefault();
      toggleHud(e);
    });
  }

  // 6. Dismiss on tap outside taskbar (mobile UX)
  document.addEventListener('touchstart', (e) => {
    if (bar.classList.contains('is-visible') && !bar.contains(e.target) && !peekHandle?.contains(e.target)) {
      scheduleHide(100);
    }
  }, { passive: true });

  // 7. Navigation Clicks Keep Taskbar Open Comfortably
  bar.querySelectorAll('button, a').forEach(el => {
    el.addEventListener('click', () => {
      showBar();
      if (!isPointerOverBar) {
        scheduleHide(2200);
      }
    });
  });
}
