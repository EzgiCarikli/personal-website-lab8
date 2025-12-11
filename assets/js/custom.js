document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  const outputBox = document.getElementById("contact-output");
  const popup = document.getElementById("form-popup");

  const fields = {
    firstName: {
      selector: 'input[name="name"]',
      label: "First name",
      type: "name",
      required: true,
    },
    surname: {
      selector: 'input[name="surname"]',
      label: "Surname",
      type: "name",
      required: true,
    },
    email: {
      selector: 'input[name="email"]',
      label: "Email",
      type: "email",
      required: true,
    },
    phone: {
      selector: 'input[name="phone"]',
      label: "Phone",
      type: "phone",
      required: true,
    },
    subject: {
      selector: 'input[name="subject"]',
      label: "Topic",
      type: "text",
      required: true,
    },
    contactMethod: {
      selector: 'select[name="contactMethod"]',
      label: "Preferred contact method",
      type: "select",
      required: true,
    },
    message: {
      selector: 'textarea[name="message"]',
      label: "Message",
      type: "text",
      required: true,
    },
    newsletter: {
      selector: 'input[name="newsletter"]',
      label: "Newsletter",
      type: "checkbox",
      required: false,
    },
  };

  function getFieldEl(key) {
    const cfg = fields[key];
    return form.querySelector(cfg.selector);
  }

  function validateField(key) {
    const cfg = fields[key];
    const el = getFieldEl(key);
    if (!el) return true;

    let value =
      cfg.type === "checkbox" ? el.checked : el.value.trim();

    let valid = true;
    let message = "";

    if (cfg.required && !value) {
      valid = false;
      message = "This field is required.";
    }

    if (valid && cfg.type === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        valid = false;
        message = "Please enter a valid email address.";
      }
    }

    if (valid && cfg.type === "name") {
      const nameRegex = /^[A-Za-zÀ-ž\s'-]+$/;
      if (!nameRegex.test(value)) {
        valid = false;
        message = "Only letters are allowed here.";
      }
    }

    if (valid && cfg.type === "phone") {
      const digits = value.replace(/\D/g, "");
      if (digits.length < 8) {
        valid = false;
        message = "Please enter a valid phone number.";
      }
    }

    const errorEl =
      el.parentElement.querySelector(".field-error");
    el.classList.remove("is-valid", "is-invalid");

    if (valid) {
      el.classList.add("is-valid");
      if (errorEl) errorEl.textContent = "";
    } else {
      el.classList.add("is-invalid");
      if (errorEl) errorEl.textContent = message;
    }

    return valid;
  }

  function validateAll() {
    let allValid = true;
    Object.keys(fields).forEach((key) => {
      if (!validateField(key)) {
        allValid = false;
      }
    });

    if (submitBtn) {
      submitBtn.disabled = !allValid;
    }
    return allValid;
  }

  const phoneInput = getFieldEl("phone");
  if (phoneInput) {
    phoneInput.addEventListener("input", (e) => {
      let digits = e.target.value.replace(/\D/g, "");

      if (digits.startsWith("86")) {
        digits = "3706" + digits.slice(2);
      }
      if (!digits.startsWith("3706")) {
        digits = "3706" + digits.replace(/^3706/, "");
      }
      digits = digits.slice(0, 11);


      let formatted = "+370 ";
      if (digits.length >= 4) {
        formatted += digits[3];
      }
      if (digits.length >= 6) {
        formatted += digits.slice(4, 6);
      }
      if (digits.length > 6) {
        formatted += " " + digits.slice(6);
      }

      e.target.value = formatted.trim();
      validateAll();
    });
  }
  Object.keys(fields).forEach((key) => {
    const el = getFieldEl(key);
    if (!el) return;

    const evt =
      el.tagName === "SELECT" || el.type === "checkbox"
        ? "change"
        : "input";

    el.addEventListener(evt, () => {
      validateField(key);
      validateAll();
    });
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault(); 

    if (!validateAll()) {
      return;
    }

    const data = {};
    Object.keys(fields).forEach((key) => {
      const cfg = fields[key];
      const el = getFieldEl(key);

      let value;
      if (cfg.type === "checkbox") {
        value = el.checked ? "Yes" : "No";
      } else {
        value = el.value.trim();
      }

      data[cfg.label] = value;
    });

    console.log("Contact form data:", data);

    if (outputBox) {
      outputBox.innerHTML = "";
      Object.entries(data).forEach(([label, value]) => {
        const p = document.createElement("p");
        p.textContent = `${label}: ${value}`;
        outputBox.appendChild(p);
      });
    }
    if (popup) {
      popup.classList.add("show");
      setTimeout(() => {
        popup.classList.remove("show");
      }, 2500);
    }
    form.reset();
    Object.keys(fields).forEach((key) => {
      const el = getFieldEl(key);
      if (!el) return;
      el.classList.remove("is-valid", "is-invalid");
      const errorEl =
        el.parentElement.querySelector(".field-error");
      if (errorEl) errorEl.textContent = "";
    });

    if (submitBtn) submitBtn.disabled = true;
  });

  validateAll();
});

(function () {
  const difficultySelect = document.getElementById('mg-difficulty');
  const startBtn = document.getElementById('mg-start');
  const restartBtn = document.getElementById('mg-restart');
  const board = document.getElementById('mg-board');
  const movesEl = document.getElementById('mg-moves');
  const matchesEl = document.getElementById('mg-matches');
  const messageEl = document.getElementById('mg-message');

  if (!board) return;

  const symbols = ['A','B','C','D','E','F','G','H','I','J','K','L'];

  let moves = 0;
  let matches = 0;
  let flippedCards = [];
  let lockBoard = false;
  let totalPairs = 0;

  function createDeck(difficulty) {
    const pairCount = difficulty === 'easy' ? 6 : 12;
    const used = symbols.slice(0, pairCount);
    const deck = [...used, ...used];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    totalPairs = pairCount;
    return deck;
  }

  function resetStats() {
    moves = 0;
    matches = 0;
    movesEl.textContent = '0';
    matchesEl.textContent = '0';
    messageEl.textContent = '';
    flippedCards = [];
    lockBoard = false;
  }

  function renderBoard(difficulty) {
    const deck = createDeck(difficulty);
    board.innerHTML = '';
    board.classList.remove('easy', 'hard');
    board.classList.add(difficulty);

    deck.forEach(symbol => {
      const card = document.createElement('div');
      card.className = 'mg-card';
      card.dataset.value = symbol;

      const span = document.createElement('span');
      span.textContent = symbol;
      card.appendChild(span);

      card.addEventListener('click', () => onCardClick(card));

      board.appendChild(card);
    });
  }

  function onCardClick(card) {
    if (lockBoard) return;
    if (card.classList.contains('flipped') || card.classList.contains('matched')) return;

    card.classList.add('flipped');
    flippedCards.push(card);

    if (flippedCards.length === 2) {
      checkMatch();
    }
  }

  function checkMatch() {
    lockBoard = true;
    moves++;
    movesEl.textContent = moves.toString();

    const [c1, c2] = flippedCards;
    if (c1.dataset.value === c2.dataset.value) {
      
      c1.classList.add('matched');
      c2.classList.add('matched');
      matches++;
      matchesEl.textContent = matches.toString();
      flippedCards = [];
      lockBoard = false;

      if (matches === totalPairs) {
        messageEl.textContent = 'You win! All pairs matched.';
      }
    } else {
      
      setTimeout(() => {
        c1.classList.remove('flipped');
        c2.classList.remove('flipped');
        flippedCards = [];
        lockBoard = false;
      }, 1000);
    }
  }

  function startGame() {
    resetStats();
    const diff = difficultySelect.value;
    renderBoard(diff);
  }

  startBtn.addEventListener('click', startGame);
  restartBtn.addEventListener('click', startGame);

  
})();