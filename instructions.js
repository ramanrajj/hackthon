const instructions = {
  "Snake Bite": [
    "Keep the person calm and still",
    "Do NOT suck the venom",
    "Remove tight clothing or jewelry",
    "Keep the bitten area below heart level",
    "Seek medical help immediately"
  ],
  "Accident": [
    "Ensure the scene is safe",
    "Do not move the injured person unless necessary",
    "Stop bleeding using pressure",
    "Keep the person warm",
    "Call emergency services"
  ],
  "Heart Attack / Stroke": [
    "Help the person sit or lie down",
    "Loosen tight clothing",
    "Do not give food or water",
    "If unconscious, check breathing",
    "Call emergency services immediately"
  ],
  "Fire": [
    "Move away from fire source",
    "Stop, drop, and roll if clothes catch fire",
    "Cover nose and mouth with cloth",
    "Do not use elevators",
    "Call firefighters immediately"
  ]
};

const reason = localStorage.getItem("finalReason");
const service = localStorage.getItem("service");

document.getElementById("instructionTitle").innerText =
  `${service} Emergency – ${reason}`;

const list = document.getElementById("instructionList");

(instructions[reason] || [
  "Stay calm",
  "Ensure safety",
  "Wait for emergency responders"
]).forEach(step => {
  const li = document.createElement("li");
  li.textContent = step;
  list.appendChild(li);
});

function goBack() {
  localStorage.removeItem("reason");
  localStorage.removeItem("finalReason");
  window.location.href = "landing.html";
}
