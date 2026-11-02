const cursor = document.getElementById("custom-cursor");
const objects = document.querySelectorAll(".object");

const popup = document.getElementById("popup");
const input = document.getElementById("label-input");
const submitButton = document.getElementById("submit-label");
const closeButton = document.getElementById("close-popup");

// Progress bar
const progressFill = document.getElementById("progress-fill");
const progressPercent = document.getElementById("progress-percent");

// Success popup
const successPopup = document.getElementById("success-popup");
const successClose = document.getElementById("success-close");

let selectedObject = null;
let hoveredObject = null;

let dots = 1;
let animation = null;
let stopTimer = null;

let celebrationShown = false;


// UPDATE PROGRESS BAR
function updateProgress() {

    const renamedCount = document.querySelectorAll(
        '.object[data-changed="true"]'
    ).length;

    const percentage = Math.round(
        (renamedCount / objects.length) * 100
    );

    progressFill.style.width = percentage + "%";
    progressPercent.textContent = percentage + "%";

    // Show celebration when all objects are renamed
    if (percentage === 100 && !celebrationShown) {
        celebrationShown = true;
        showCelebration();
    }
}


// SHOW CELEBRATION
function showCelebration() {

    successPopup.classList.add("show");

    // Create confetti shapes
    const colors = [
        "red", "orange", "gold",
        "hotpink", "blue", "limegreen",
        "purple"
    ];

    for (let i = 0; i < 80; i++) {

        const confetti = document.createElement("div");

        confetti.classList.add("confetti");

        // Random position
        confetti.style.left = Math.random() * 100 + "vw";

        // Random color
        confetti.style.backgroundColor =
            colors[Math.floor(Math.random() * colors.length)];

        // Random size
        confetti.style.width = (Math.random() * 10 + 5) + "px";
        confetti.style.height = (Math.random() * 12 + 5) + "px";

        // Random shape
        if (Math.random() > 0.5) {
            confetti.style.borderRadius = "50%";
        }

        // Random falling speed and delay
        confetti.style.animationDuration =
            (Math.random() * 2 + 2) + "s";

        confetti.style.animationDelay =
            (Math.random() * 1.5) + "s";

        successPopup.appendChild(confetti);

        // Remove confetti after animation
        setTimeout(function() {
            confetti.remove();
        }, 5000);
    }
}


// Close success popup
successClose.addEventListener("click", function() {
    successPopup.classList.remove("show");
});


// Animate exploring dots
function animateExploring() {
    cursor.textContent = "EXPLORING" + ".".repeat(dots);

    dots++;

    if (dots > 3) {
        dots = 1;
    }
}


// Start exploring animation
function startExploring() {
    if (hoveredObject) return;

    clearInterval(animation);

    animateExploring();
    animation = setInterval(animateExploring, 400);
}


// Stop animation and show plain EXPLORING
function stopExploring() {
    clearInterval(animation);
    animation = null;

    cursor.textContent = "EXPLORING";
}


// Move custom cursor
document.addEventListener("mousemove", function(e) {

    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";

    if (hoveredObject) return;

    if (!animation) {
        startExploring();
    }

    clearTimeout(stopTimer);

    stopTimer = setTimeout(function() {
        stopExploring();
    }, 1000);

});


// Hover and click images
objects.forEach(function(object) {

    object.addEventListener("mouseenter", function() {

        hoveredObject = object;

        clearInterval(animation);
        animation = null;

        clearTimeout(stopTimer);

        cursor.textContent = object.dataset.label || "EXPLORE";

        if (object.dataset.changed === "true") {
            cursor.classList.add("changed");
        } else {
            cursor.classList.remove("changed");
        }

    });


    object.addEventListener("mouseleave", function() {

        hoveredObject = null;

        cursor.classList.remove("changed");

        startExploring();

        clearTimeout(stopTimer);

        stopTimer = setTimeout(function() {
            stopExploring();
        }, 1000);

    });


    // Click object to open popup
    object.addEventListener("click", function() {

        selectedObject = object;

        input.value = object.dataset.label || "";

        popup.style.display = "flex";

        input.focus();

    });

});


// Submit new label
submitButton.addEventListener("click", function() {

    if (selectedObject && input.value.trim() !== "") {

        selectedObject.dataset.label = input.value.trim();

        selectedObject.dataset.changed = "true";

        updateProgress();

        popup.style.display = "none";

        cursor.textContent = selectedObject.dataset.label;

        cursor.classList.add("changed");

    }

});


// Close label popup
function closePopup() {

    popup.style.display = "none";

    selectedObject = null;

}

closeButton.addEventListener("click", closePopup);


// Close label popup by clicking outside
popup.addEventListener("click", function(e) {

    if (e.target === popup) {
        closePopup();
    }

});


// Initialize progress
updateProgress();