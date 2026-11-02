
const cursor = document.getElementById("custom-cursor");

const objects = document.querySelectorAll(".object");

// Move cursor with mouse
document.addEventListener("mousemove", function(e) {

    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";

});

// Change cursor text when hovering over PNGs
objects.forEach(function(object) {

    object.addEventListener("mouseenter", function() {

        cursor.textContent = object.dataset.label;

    });

    object.addEventListener("mouseleave", function() {

        cursor.textContent = "EXPLORE";

    });

});
