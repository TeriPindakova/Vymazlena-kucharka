// Vyčistí formulář po návratu ze stránky Formspree
window.addEventListener("pageshow", function (event) {
  if (event.persisted) {
    const form = document.querySelector("form");
    if (form) form.reset();
  }
});