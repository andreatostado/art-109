const poster = document.querySelector(".poster");
const cursor = document.getElementById("custom-cursor");

const popup = document.getElementById("popup");
const popupTitle = document.getElementById("popup-title");
const popupDescription = document.getElementById("popup-description");

const objects = document.querySelectorAll(".object");

// Make cursor follow mouse
poster.addEventListener("mousemove", function(event) {
  const rect = poster.getBoundingClientRect();

  cursor.style.left = (event.clientX - rect.left) + "px";
  cursor.style.top = (event.clientY - rect.top) + "px";
});

poster.addEventListener("mouseenter", function() {
  cursor.style.display = "flex";
});

poster.addEventListener("mouseleave", function() {
  cursor.style.display = "none";
  popup.style.display = "none";
});

// Detect PNG hover
objects.forEach(function(object) {

  object.addEventListener("mouseenter", function() {

    cursor.textContent = object.dataset.label;

    popupTitle.textContent = object.dataset.label;
    popupDescription.textContent = object.dataset.description;

    popup.style.display = "block";
  });

  object.addEventListener("mouseleave", function() {
    cursor.textContent = "EXPLORE";
    popup.style.display = "none";
  });

});