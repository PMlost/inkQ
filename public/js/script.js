// ===== GLOBAL VARIABLES =====
let currentQuote = null;
let isLoading = false;

// ===== DOM ELEMENTS =====
const elements = {
  loadingScreen: document.getElementById("loading-screen"),
  app: document.getElementById("app"),
  quoteCard: document.getElementById("quote-card"),
  quoteText: document.getElementById("quote-text"),
  quoteAuthor: document.getElementById("quote-author"),
  quoteSource: document.getElementById("quote-source"),
  quoteBackground: document.getElementById("quote-background"),

  // Modal elements
  modal: document.getElementById("quote-modal"),
  modalQuoteText: document.getElementById("modal-quote-text"),
  modalAuthor: document.getElementById("modal-author"),
  modalDescription: document.getElementById("modal-description"),
  modalTags: document.getElementById("modal-tags"),
  closeModal: document.getElementById("close-modal"),
};

// ===== API FUNCTIONS =====
// ===== ENHANCED API FUNCTIONS FOR DEBUGGING =====
async function fetchAPI(endpoint) {
  try {
    console.log(`🔍 Fetching: /api${endpoint}`);
    const response = await fetch(`/api${endpoint}`);

    console.log(`📡 Response status: ${response.status}`);
    console.log(`📡 Response headers:`, response.headers);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Check what we're actually getting
    const textResponse = await response.text();
    console.log(`📄 Raw response:`, textResponse);

    if (!textResponse || textResponse.trim() === "") {
      console.log(`⚠️ Empty response received`);
      return null;
    }

    try {
      const jsonData = JSON.parse(textResponse);
      console.log(`✅ Parsed JSON:`, jsonData);
      return jsonData;
    } catch (parseError) {
      console.error(`❌ JSON Parse Error:`, parseError);
      console.log(`📄 Response was:`, textResponse.substring(0, 200));
      throw new Error(`Invalid JSON response: ${parseError.message}`);
    }
  } catch (error) {
    console.error("API Error:", error);
    showError("Failed to load today's wisdom. Please refresh the page.");
    return null;
  }
}

// ===== QUOTE DISPLAY FUNCTIONS =====
async function loadDailyQuote() {
  if (isLoading) return;
  setLoading(true);

  const quote = await fetchAPI("/quotes/daily");
  if (quote) {
    displayQuote(quote);
  }

  setLoading(false);
}

// Display today's date instead of quote ID
function displayQuote(quote) {
  if (!quote) return;

  currentQuote = quote;

  // Update quote content
  elements.quoteText.textContent = quote.text;
  elements.quoteAuthor.textContent = quote.author;

  // Show today's date beautifully formatted
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  elements.quoteSource.textContent = formattedDate; // "Sunday, August 10"

  // Rest of your function...
  setQuoteBackgroundImage(quote);

  elements.quoteCard.classList.remove("fade-in");
  setTimeout(() => {
    elements.quoteCard.classList.add("fade-in");
  }, 50);
}

// ===== BACKGROUND IMAGE FUNCTIONS =====
function setQuoteBackgroundImage(quote) {
  const backgroundElement = elements.quoteBackground;

  // Check if quote has an image_url
  if (quote.image_url) {
    // Convert ImgBB share URL to direct image URL if needed
    const directImageUrl = convertToDirectUrl(quote.image_url);

    // Test if image exists before setting it
    const img = new Image();

    img.onload = function () {
      // Image loaded successfully - set as background
      backgroundElement.style.backgroundImage = `url('${directImageUrl}')`;
      removeThemeClasses(backgroundElement);
      console.log(`✅ Background image loaded: ${directImageUrl}`);
    };

    img.onerror = function () {
      // Image failed to load - fallback to gradient theme
      console.log(`⚠️ Image failed to load: ${directImageUrl}, using fallback`);
      backgroundElement.style.backgroundImage = "none";
      setQuoteBackground("cosmic"); // fallback theme
    };

    // Start loading the image
    img.src = directImageUrl;
  } else {
    // No image URL provided - use fallback theme
    backgroundElement.style.backgroundImage = "none";
    setQuoteBackground("cosmic");
  }
}

// Convert ImgBB share URL to direct image URL
function convertToDirectUrl(url) {
  // If already a direct URL, return as is
  if (url.includes("i.ibb.co")) {
    return url;
  }

  // Convert share URL to direct URL
  // From: https://ibb.co/5x2wbTXY
  // To: https://i.ibb.co/5x2wbTXY/image.png
  if (url.includes("ibb.co/")) {
    const imageId = url.split("/").pop();
    return `https://i.ibb.co/${imageId}/image.png`;
  }

  // Return original URL if no conversion needed
  return url;
}

function removeThemeClasses(element) {
  const themeClasses = [
    "theme-sunset",
    "theme-meditation",
    "theme-cosmic",
    "theme-divine",
    "theme-action",
  ];

  themeClasses.forEach((className) => {
    element.classList.remove(className);
  });
}

function setQuoteBackground(theme) {
  const backgroundElement = elements.quoteBackground;

  removeThemeClasses(backgroundElement);
  backgroundElement.style.backgroundImage = "none";

  switch (theme) {
    case "sunset":
      backgroundElement.classList.add("theme-sunset");
      break;
    case "meditation":
      backgroundElement.classList.add("theme-meditation");
      break;
    case "cosmic":
      backgroundElement.classList.add("theme-cosmic");
      break;
    case "divine":
      backgroundElement.classList.add("theme-divine");
      break;
    case "action":
      backgroundElement.classList.add("theme-action");
      break;
    default:
      backgroundElement.classList.add("theme-cosmic");
  }
}

// ===== MODAL FUNCTIONS =====
function openQuoteModal() {
  if (!currentQuote) return;

  elements.modalQuoteText.textContent = currentQuote.text;
  elements.modalAuthor.textContent = currentQuote.author;
  elements.modalDescription.textContent = currentQuote.description;

  // Display tags
  displayModalTags(currentQuote.tags);

  // Show modal
  elements.modal.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function closeQuoteModal() {
  elements.modal.style.display = "none";
  document.body.style.overflow = "auto";
}

function displayModalTags(tags) {
  elements.modalTags.innerHTML = "";

  if (tags && Array.isArray(tags)) {
    tags.forEach((tag) => {
      const tagElement = document.createElement("span");
      tagElement.className = "tag";
      tagElement.textContent = `#${tag}`;
      elements.modalTags.appendChild(tagElement);
    });
  }
}

// ===== UTILITY FUNCTIONS =====
function setLoading(loading) {
  isLoading = loading;

  if (loading) {
    elements.quoteCard.classList.add("loading");
    elements.quoteText.textContent = "Loading your daily inspiration...";
    elements.quoteAuthor.textContent = "";
    elements.quoteSource.textContent = "";
  } else {
    elements.quoteCard.classList.remove("loading");
  }
}

function showError(message) {
  elements.quoteText.textContent = message;
  elements.quoteAuthor.textContent = "";
  elements.quoteSource.textContent = "";
  setQuoteBackground("cosmic");
}

// ===== DATE UTILITY FUNCTIONS =====
function getCurrentDateString() {
  const today = new Date();
  return today.toISOString().split("T")[0]; // Returns YYYY-MM-DD format
}

function formatDateForDisplay(dateString) {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ===== UTC TIMER FUNCTIONALITY =====
let timerInterval = null;

// Add timer elements to the elements object
const timerElements = {
  hoursElement: document.getElementById("hours"),
  minutesElement: document.getElementById("minutes"),
  secondsElement: document.getElementById("seconds"),
};

// Calculate time until next UTC day (midnight UTC)
function getTimeUntilNextUTCDay() {
  const now = new Date();
  const utcNow = new Date(now.getTime() + now.getTimezoneOffset() * 60000);

  // Get next UTC midnight
  const nextMidnight = new Date(utcNow);
  nextMidnight.setUTCHours(24, 0, 0, 0);

  // Calculate difference in milliseconds
  const timeDiff = nextMidnight.getTime() - utcNow.getTime();

  // Convert to hours, minutes, seconds
  const hours = Math.floor(timeDiff / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds };
}

// Format number with leading zero
function formatTimeUnit(value) {
  return value.toString().padStart(2, "0");
}

// Update timer display
function updateTimer() {
  try {
    const timeLeft = getTimeUntilNextUTCDay();

    if (timerElements.hoursElement) {
      timerElements.hoursElement.textContent = formatTimeUnit(timeLeft.hours);
    }
    if (timerElements.minutesElement) {
      timerElements.minutesElement.textContent = formatTimeUnit(
        timeLeft.minutes
      );
    }
    if (timerElements.secondsElement) {
      timerElements.secondsElement.textContent = formatTimeUnit(
        timeLeft.seconds
      );
    }

    // If we've reached the new day, refresh the page to load new quote
    if (
      timeLeft.hours === 0 &&
      timeLeft.minutes === 0 &&
      timeLeft.seconds === 0
    ) {
      console.log("🕛 New UTC day reached! Refreshing for new quote...");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  } catch (error) {
    console.error("Timer update error:", error);
  }
}

// Start the timer
function startUTCTimer() {
  // Clear any existing timer
  if (timerInterval) {
    clearInterval(timerInterval);
  }

  // Update immediately
  updateTimer();

  // Update every second
  timerInterval = setInterval(updateTimer, 1000);

  console.log("⏰ UTC Timer started");
}

// Stop the timer
function stopUTCTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
    console.log("⏹️ UTC Timer stopped");
  }
}

// Initialize timer elements after DOM is loaded
function initializeTimer() {
  // Update timer elements references
  Object.assign(timerElements, {
    hoursElement: document.getElementById("hours"),
    minutesElement: document.getElementById("minutes"),
    secondsElement: document.getElementById("seconds"),
  });

  // Check if elements exist
  if (
    timerElements.hoursElement &&
    timerElements.minutesElement &&
    timerElements.secondsElement
  ) {
    startUTCTimer();
    console.log("✅ UTC Timer initialized successfully");
  } else {
    console.error("❌ Timer elements not found in DOM");
  }
}

// Add cleanup when page unloads
window.addEventListener("beforeunload", stopUTCTimer);

// ===== EVENT LISTENERS =====
function initializeEventListeners() {
  // Quote card click - open modal
  elements.quoteCard.addEventListener("click", openQuoteModal);

  // Modal controls
  elements.closeModal.addEventListener("click", closeQuoteModal);

  // Click outside modal to close
  elements.modal.addEventListener("click", (e) => {
    if (e.target === elements.modal) {
      closeQuoteModal();
    }
  });

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "Escape":
        closeQuoteModal();
        break;
      case " ":
        e.preventDefault();
        if (
          !elements.modal.style.display ||
          elements.modal.style.display === "none"
        ) {
          openQuoteModal();
        }
        break;
    }
  });

  // Handle image loading errors globally
  window.addEventListener(
    "error",
    function (e) {
      if (e.target.tagName === "IMG") {
        console.log("🖼️ Image loading error handled gracefully");
      }
    },
    true
  );
}

// ===== INITIALIZATION =====
async function initializeApp() {
  console.log("🚀 InkSpire app starting...");

  // Hide loading screen after a brief delay
  setTimeout(() => {
    elements.loadingScreen.style.opacity = "0";
    setTimeout(() => {
      elements.loadingScreen.style.display = "none";
      elements.app.style.display = "block";
      console.log("✅ Loading screen hidden, app visible");
    }, 500);
  }, 1500);

  // Initialize event listeners
  initializeEventListeners();

  // Initialize UTC timer - ADD THIS LINE
  initializeTimer();

  // Load today's quote
  await loadDailyQuote();

  console.log("🎯 InkSpire app initialized successfully");

  // Display current date info for debugging
  const currentDate = getCurrentDateString();
  console.log(`📅 Current date: ${currentDate}`);
}

// ===== TESTING FUNCTIONS (For Development) =====
// Test specific date quote (use in browser console)
async function testDateQuote(testDate) {
  try {
    const response = await fetch("/api/quotes");
    const data = await response.json();

    if (data.quotes && data.quotes[testDate]) {
      displayQuote(data.quotes[testDate]);
      console.log(`🧪 Testing quote for ${testDate}:`, data.quotes[testDate]);
    } else {
      console.log(`❌ No quote found for ${testDate}`);
      console.log("Available dates:", Object.keys(data.quotes || {}));
    }
  } catch (error) {
    console.error("Test error:", error);
  }
}

// ===== START APP =====
document.addEventListener("DOMContentLoaded", initializeApp);

// ===== DEVELOPMENT HELPERS =====
// Make test function available in development
if (
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
) {
  window.testDateQuote = testDateQuote;
  console.log(
    '🛠️ Development mode: Use testDateQuote("2025-08-13") to test specific dates'
  );
}
