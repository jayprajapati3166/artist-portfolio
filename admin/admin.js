// This file handles BOTH login & dashboard logic

// =======================
// ADMIN LOGIN
// =======================
const loginForm = document.getElementById("adminLoginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const error = document.getElementById("error");

    try {
      const res = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        error.textContent = data.error || "Login failed";
        return;
      }

      // 🔑 SAVE TOKEN
      localStorage.setItem("adminToken", data.token);

      // GO TO DASHBOARD
      window.location.href = "admin-dashboard.html";

    } catch (err) {
      error.textContent = "Server error";
    }
  });

  
}
