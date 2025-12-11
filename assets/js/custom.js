document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  const outputBox = document.getElementById("contact-output");
  const popup = document.getElementById("form-popup");

  // Formdaki alanları tek yerden yönetelim
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

  // Tek alanı validate eden fonksiyon
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

    // Görsel feedback
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

  // Telefon input maskesi (LT formatına benzer)
  const phoneInput = getFieldEl("phone");
  if (phoneInput) {
    phoneInput.addEventListener("input", (e) => {
      let digits = e.target.value.replace(/\D/g, "");

      // 86xxxx -> 3706xxxx şekline çevir
      if (digits.startsWith("86")) {
        digits = "3706" + digits.slice(2);
      }

      // 3706 ile başlamıyorsa zorla
      if (!digits.startsWith("3706")) {
        digits = "3706" + digits.replace(/^3706/, "");
      }

      // En fazla +370 6xx xxxxx (11 rakam) kadar
      digits = digits.slice(0, 11);

      // +370 6xx xxxxx formatla
      let formatted = "+370 ";
      if (digits.length >= 4) {
        formatted += digits[3]; // 6
      }
      if (digits.length >= 6) {
        formatted += digits.slice(4, 6); // xx
      }
      if (digits.length > 6) {
        formatted += " " + digits.slice(6);
      }

      e.target.value = formatted.trim();
      validateAll();
    });
  }

  // Real-time validation: input/change eventleri
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

  // Submit işlemi
  form.addEventListener("submit", function (e) {
    e.preventDefault(); // sayfanın reload olmasını engelle

    if (!validateAll()) {
      return;
    }

    // Tüm değerleri JS objesine topla
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

    // Aynı veriyi formun altında göster
    if (outputBox) {
      outputBox.innerHTML = "";
      Object.entries(data).forEach(([label, value]) => {
        const p = document.createElement("p");
        p.textContent = `${label}: ${value}`;
        outputBox.appendChild(p);
      });
    }

    // Popup göster
    if (popup) {
      popup.classList.add("show");
      setTimeout(() => {
        popup.classList.remove("show");
      }, 2500);
    }

    // Formu temizle ve butonu tekrar disable yap
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

  // Sayfa açıldığında da kontrol et
  validateAll();
});