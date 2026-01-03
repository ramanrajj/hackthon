/* =========================
   SIGNUP
========================= */
function signup() {
    const name = document.getElementById("name")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value.trim();
    const msg = document.getElementById("msg");

    if (!name || !email || !password) {
        msg.textContent = "All fields are required";
        msg.style.color = "red";
        return;
    }

    const user = { name, email, password };
    localStorage.setItem("user", JSON.stringify(user));

    msg.textContent = "Signup successful! Redirecting to login...";
    msg.style.color = "green";

    setTimeout(() => {
        window.location.href = "login.html";
    }, 1200);
}

/* =========================
   LOGIN
========================= */
function login() {
    const email = document.getElementById("loginEmail")?.value.trim();
    const password = document.getElementById("loginPassword")?.value.trim();
    const msg = document.getElementById("loginMsg");

    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
        msg.textContent = "No account found. Please signup first.";
        msg.style.color = "red";
        return;
    }

    const user = JSON.parse(storedUser);

    if (email !== user.email || password !== user.password) {
        msg.textContent = "Invalid email or password";
        msg.style.color = "red";
        return;
    }

    localStorage.setItem("isLoggedIn", "true");
    window.location.href = "landing.html";
}

/* =========================
   LOGOUT
========================= */
function logout() {
    localStorage.removeItem("isLoggedIn");
    window.location.href = "login.html";
}

/* =========================
   LANDING → SERVICES
========================= */
function goToServices() {
    if (!localStorage.getItem("isLoggedIn")) {
        alert("Please login first!");
        window.location.href = "login.html";
        return;
    }
    window.location.href = "services.html";
}

/* =========================
   SERVICE REASONS
========================= */
const serviceReasons = {
    Police: [
        "Theft / Burglary",
        "Assault / Violence",
        "Traffic Violation",
        "Domestic Disturbance",
        "Public Disorder",
        "Kidnapping / Missing Person",
        "Harassment"
    ],
    Ambulance: [
        "Accident",
        "Snake Bite",
        "Fall / Injury",
        "Cut / Bleeding",
        "Heart Attack / Stroke",
        "Severe Pain",
        "Choking"
    ],
    Firefighter: [
        "House Fire",
        "Forest Fire",
        "Vehicle Fire",
        "Chemical Fire",
        "Gas Leak",
        "Rescue Operation",
        "Explosion"
    ]
};

/* =========================
   SELECT SERVICE
========================= */
function selectService(service) {
    localStorage.setItem("service", service);

    document.getElementById("signalSection")?.classList.remove("hidden");
    document.getElementById("selectedService").innerText =
        service + " Emergency Selected";

    document.getElementById("reasonSection")?.classList.add("hidden");
    localStorage.removeItem("reason");
}

/* =========================
   SHOW REASONS
========================= */
function showReasons() {
    const service = localStorage.getItem("service");
    if (!service) return;

    const container = document.querySelector(".reason-cards");
    container.innerHTML = "";

    serviceReasons[service].forEach(reason => {
        const div = document.createElement("div");
        div.className = "reason";
        div.textContent = reason;
        div.onclick = () => selectReason(div);
        container.appendChild(div);
    });

    document.getElementById("reasonSection")?.classList.remove("hidden");
}

/* =========================
   SELECT REASON
========================= */
function selectReason(el) {
    document.querySelectorAll(".reason").forEach(r => {
        r.style.border = "none";
    });

    el.style.border = "2px solid green";
    localStorage.setItem("reason", el.innerText);
}

/* =========================
   SUBMIT EMERGENCY
========================= */
function submitEmergency() {
    const selectedReason = localStorage.getItem("reason");
    const otherText = document.querySelector("textarea")?.value.trim();

    const finalReason = selectedReason || otherText;
    if (!finalReason) {
        alert("Please select or enter a reason.");
        return;
    }

    localStorage.setItem("finalReason", finalReason);

    window.location.href = "instructions.html";
}
