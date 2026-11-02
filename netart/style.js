const cursor = document.getElementById("custom-cursor");
const objects = document.querySelectorAll(".object");

const popup = document.getElementById("popup");
const input = document.getElementById("label-input");
const submitButton = document.getElementById("submit-label");
const closeButton = document.getElementById("close-popup");

let selectedObject = null;
let hoveredObject = null;

let dots = 1;
let animation = null;
let stopTimer = null;


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

    cursor.textContent = "EXPLORE";
}


// Move custom cursor
document.addEventListener("mousemove", function(e) {

    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";

    // Don't animate while hovering over an object
    if (hoveredObject) return;

    // Start the dots animation
    if (!animation) {
        startExploring();
    }

    // Reset timer whenever the mouse moves
    clearTimeout(stopTimer);

    // If mouse stays still for 1 second, remove the dots
    stopTimer = setTimeout(function() {
        stopExploring();
    }, 1000);

});


// Hover and click images
objects.forEach(function(object) {

    // When mouse enters an object
    object.addEventListener("mouseenter", function() {

        hoveredObject = object;

        clearInterval(animation);
        animation = null;

        clearTimeout(stopTimer);

        // Show object's label
        cursor.textContent = object.dataset.label || "EXPLORE";

        // Turn cursor red if label was changed
        if (object.dataset.changed === "true") {
            cursor.classList.add("changed");
        } else {
            cursor.classList.remove("changed");
        }

    });


    // When mouse leaves an object
    object.addEventListener("mouseleave", function() {

        hoveredObject = null;

        cursor.classList.remove("changed");

        // Restart exploring animation
        startExploring();

        clearTimeout(stopTimer);

        stopTimer = setTimeout(function() {
            stopExploring();
        }, 1000);

    });


    // Click object to open pop-up
    object.addEventListener("click", function() {

        selectedObject = object;

        input.value = object.dataset.label || "";

        popup.style.display = "flex";

        input.focus();

    });

});


// Submit a new label
submitButton.addEventListener("click", function() {

    if (selectedObject && input.value.trim() !== "") {

        selectedObject.dataset.label = input.value.trim();

        selectedObject.dataset.changed = "true";

        popup.style.display = "none";

        cursor.textContent = selectedObject.dataset.label;

        cursor.classList.add("changed");

    }

});


// Close pop-up
function closePopup() {

    popup.style.display = "none";

    selectedObject = null;

}

closeButton.addEventListener("click", closePopup);


// Close pop-up when clicking outside the box
popup.addEventListener("click", function(e) {

    if (e.target === popup) {
        closePopup();
    }

});