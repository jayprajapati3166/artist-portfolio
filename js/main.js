// =========================
// ART MODAL (SAFE)
// =========================
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("artModal");

  // Run ONLY on art page
  if (modal) {
    const cards = [...document.querySelectorAll(".art-card")];
    const modalImg = modal.querySelector(".modal-img");
    const modalTitle = modal.querySelector("h2");
    const modalMedium = modal.querySelector(".medium");
    const modalDesc = modal.querySelector(".description");
    const closeBtn = modal.querySelector(".close");
    const nextBtn = modal.querySelector(".next");
    const prevBtn = modal.querySelector(".prev");

    let currentIndex = 0;

    function openModal(index) {
      const card = cards[index];
      modal.classList.add("active");
      modalImg.src = card.querySelector("img").src;
      modalTitle.textContent = card.dataset.title || "";
      modalMedium.textContent = card.dataset.medium || "";
      modalDesc.textContent = card.dataset.desc || "";
      currentIndex = index;
    }

    cards.forEach((card, index) => {
      card.addEventListener("click", () => openModal(index));
    });

    nextBtn.onclick = () => {
      currentIndex = (currentIndex + 1) % cards.length;
      openModal(currentIndex);
    };

    prevBtn.onclick = () => {
      currentIndex = (currentIndex - 1 + cards.length) % cards.length;
      openModal(currentIndex);
    };

    closeBtn.onclick = () => modal.classList.remove("active");
    modal.onclick = e => { if (e.target === modal) modal.classList.remove("active"); };

    document.addEventListener("keydown", e => {
      if (!modal.classList.contains("active")) return;
      if (e.key === "Escape") modal.classList.remove("active");
      if (e.key === "ArrowRight") nextBtn.click();
      if (e.key === "ArrowLeft") prevBtn.click();
    });
  }
});


// =========================
// REVEAL ON SCROLL (SAFE)
// =========================
const reveals = document.querySelectorAll(".reveal");

const revealOnScroll = () => {
  const windowHeight = window.innerHeight;
  const revealPoint = 100;

  reveals.forEach(el => {
    const elementTop = el.getBoundingClientRect().top;
    if (elementTop < windowHeight - revealPoint) {
      el.classList.add("active");
    }
  });
};

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);


// =========================
// MOBILE MENU TOGGLE (SAFE)
// =========================
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  if (!menuToggle || !navLinks) return;

  menuToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    navLinks.classList.toggle("active");
  });

  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
    });
  });

document.addEventListener("click", (e) => {
  const navbar = document.querySelector(".navbar");
  if (navbar && !navbar.contains(e.target)) {
    navLinks.classList.remove("active");
  }
});
});


// =========================
// HERO SLIDER (SAFE)
// =========================
const slides = document.querySelectorAll(".slide");
const dots = document.querySelectorAll(".dot");

let currentSlide = 0;
let sliderInterval = null;

function startSlider() {
  sliderInterval = setInterval(() => {
    slides[currentSlide].classList.remove("active");
    dots[currentSlide].classList.remove("active");

    currentSlide = (currentSlide + 1) % slides.length;

    slides[currentSlide].classList.add("active");
    dots[currentSlide].classList.add("active");
  }, 4000);
}

function stopSlider() {
  clearInterval(sliderInterval);
}

// start slider on load
startSlider();

// 🔴 CRITICAL: stop slider when user clicks a button
document.querySelectorAll(".slide-content a").forEach(btn => {
  btn.addEventListener("click", () => {
    stopSlider();
  });
});


const estimatorForm = document.getElementById("estimatorForm");
const estimateResult = document.getElementById("estimateResult");

if (estimatorForm) {
  estimatorForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const projectType = document.getElementById("projectType").value;
    const areaType = document.getElementById("areaType").value;
    const area = Number(document.getElementById("area").value);

    if (!projectType || !areaType || !area) {
      estimateResult.textContent = "Please fill all fields correctly.";
      return;
    }

    let rate = 0;

    // Base rates (example logic)
    if (projectType === "fresh") rate += 20;
    if (projectType === "repaint") rate += 15;

    if (areaType === "exterior") rate += 5;

    const minCost = area * rate;
    const maxCost = minCost + area * 5;

const message = `
Hello, I would like a painting quotation.

Project Type: ${projectType}
Area Type: ${areaType}
Total Area: ${area} sq ft
Estimated Budget: ₹${minCost.toLocaleString()} – ₹${maxCost.toLocaleString()}
`;

const whatsappNumber = "919974666144"; // ← replace with your father's number (no +)

const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

estimateResult.innerHTML = `
  <p>
    Estimated Cost: <strong>₹${minCost.toLocaleString()} – ₹${maxCost.toLocaleString()}</strong><br>
    <small>Final cost may vary after site inspection.</small>
  </p>

  <a href="${whatsappLink}" target="_blank" class="whatsapp-btn">
    Send enquiry on WhatsApp
  </a>
`;

  });
}


// =========================
// CONTACT FORM SUBMIT
// =========================
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    formStatus.textContent = "Sending...";
    formStatus.style.color = "#555";

    const formData = new FormData(contactForm);

    const payload = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      service_type: formData.get("service_type"),
      message: formData.get("message"),
    };

    try {
      const res = await fetch("http://localhost:5000/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      formStatus.textContent = "✅ Enquiry sent successfully!";
      formStatus.style.color = "green";
      contactForm.reset();

      // WhatsApp redirect
      const whatsappNumber = "919974666144";
      const text = encodeURIComponent(
        `Hello, my name is ${payload.name}.
I am interested in ${payload.service_type}.
Phone: ${payload.phone}
Message: ${payload.message || "No message"}`
      );

      setTimeout(() => {
        window.open(
          `https://wa.me/${whatsappNumber}?text=${text}`,
          "_blank"
        );
      }, 800);

    } catch (err) {
      formStatus.textContent = "❌ Failed to send. Please try again.";
      formStatus.style.color = "red";
      console.error(err.message);
    }
  });
}


