
// DROPDOWN NA FILTR
document.querySelectorAll('.custom-select').forEach(select => {
  const selected = select.querySelector('.selected');
  const options = select.querySelector('.options');

  selected.addEventListener('click', (e) => {
    e.stopPropagation(); // zabrání zavření při kliknutí na samotný select
    // zavře ostatní selecty
    document.querySelectorAll('.custom-select').forEach(s => {
      if (s !== select) s.classList.remove('open');
    });
    select.classList.toggle('open');
  });

  options.querySelectorAll('li').forEach(option => {
    option.addEventListener('click', (e) => {
      e.stopPropagation();
      selected.textContent = option.textContent;
      selected.dataset.value = option.dataset.value;
      select.classList.remove('open');
    });
  });
});

// kliknutí mimo dropdown => zavře všechny
document.addEventListener('click', () => {
  document.querySelectorAll('.custom-select.open').forEach(select => {
    select.classList.remove('open');
  });
});



// DRAG TO SCROLL
const photoStrip = document.querySelector('.photos-strip');
if (photoStrip) {
  let isDown = false;
  let startX;
  let scrollLeft;

  photoStrip.addEventListener('mousedown', e => {
    isDown = true;
    photoStrip.classList.add('active');
    startX = e.pageX - photoStrip.offsetLeft;
    scrollLeft = photoStrip.scrollLeft;
  });

  photoStrip.addEventListener('mouseleave', () => (isDown = false));
  photoStrip.addEventListener('mouseup', () => (isDown = false));

  photoStrip.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - photoStrip.offsetLeft;
    const walk = (x - startX) * 2; // rychlost
    photoStrip.scrollLeft = scrollLeft - walk;
  });
}


// ARROW BUTTONS
const leftArrow = document.querySelector('.arrow.left');
const rightArrow = document.querySelector('.arrow.right');

if (photoStrip && leftArrow && rightArrow) {
  leftArrow.addEventListener('click', () => {
    photoStrip.scrollBy({ left: -400, behavior: 'smooth' });
  });

  rightArrow.addEventListener('click', () => {
    photoStrip.scrollBy({ left: 400, behavior: 'smooth' });
  });
}

// HOME - filtru => přesměrování na recepty.html
document.querySelectorAll('.custom-select .options li').forEach(option => {
  option.addEventListener('click', () => {
    const category = option.closest('.custom-select').dataset.name; // např. "meat"
    const value = option.dataset.value; // např. "králičí"
    // Přesměrování na recepty.html s parametrem (např. ?meat=králičí)
    window.location.href = `recepty.html?${category}=${encodeURIComponent(value)}`;
  });
});

//VYHLEDÁVAČ
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("global-search");

  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const term = searchInput.value.trim();
        if (term) {
          // Přesměrování na recepty.html s parametrem ?search=
          window.location.href = `recepty.html?search=${encodeURIComponent(term)}`;
        }
      }
    });
  }
});

