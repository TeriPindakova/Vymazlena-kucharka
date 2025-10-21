// === Získání všech parametrů z URL ===
const params = new URLSearchParams(window.location.search);

// === Kategorie filtrů ===
const allFilterCategories = {
  meat: "Maso",
  side: "Příloha",
  cuisine: "Kuchyně",
  spicy: "Pálivost",
  other: "Jiné",
  bake: "Pečení",
};

// === Související filtry ===
const relatedFilters = {
  meat: ["side", "cuisine", "spicy"],
  side: ["meat", "cuisine", "spicy"],
  cuisine: ["meat", "side", "spicy"],
  spicy: ["meat", "side", "cuisine"],
};

// === Hlavní logika ===
fetch("recipes.json")
  .then(response => response.json())
  .then(recipes => {
    const main = document.querySelector("main");

    // --- Kontejnery ---
    let filtersContainer = document.querySelector(".filters");
    if (!filtersContainer) {
      filtersContainer = document.createElement("section");
      filtersContainer.classList.add("filters");
      main.prepend(filtersContainer);
    }

    let list = document.getElementById("recipe-list");
    if (!list) {
      list = document.createElement("div");
      list.id = "recipe-list";
      main.appendChild(list);
    }

    let currentIndex = 0; // globální index

    // === Filtrace receptů podle URL parametrů ===
    const filteredRecipes = recipes.filter(recipe => {
      for (const [key, value] of params.entries()) {
        if (key === "search") {
          const term = value.toLowerCase();
          if (
            !(
              (recipe.name && recipe.name.toLowerCase().includes(term)) ||
              (recipe.description && recipe.description.toLowerCase().includes(term)) ||
              (recipe.ingredients && recipe.ingredients.join(" ").toLowerCase().includes(term))
            )
          ) return false;
        } else if (key === "id") {
          if (recipe.id !== Number(value)) return false;
        } else {
          if (Array.isArray(recipe[key])) {
            if (!recipe[key].includes(value)) return false;
          } else if (recipe[key] !== value) return false;
        }
      }
      return true;
    });

// === Funkce pro generování filtrů ===
function renderFilters() {
  filtersContainer.innerHTML = "";

  // === Přepínací tlačítko pro mobil ===
  const toggleBtn = document.createElement("button");
  toggleBtn.classList.add("toggle-filters");
  toggleBtn.textContent = "Další výběr";
  filtersContainer.appendChild(toggleBtn);

  // === Vlastní kontejnér pro filtry ===
  const innerFilters = document.createElement("div");
  innerFilters.classList.add("inner-filters");
  filtersContainer.appendChild(innerFilters);

  let filtersToShow = Object.keys(allFilterCategories);
  const specialFiltersMap = { soup: ["cuisine", "spicy"] };
  const isSpecialOther = params.get("other") === "polévka";

  if (params.has("search")) filtersToShow = [];
  else if (isSpecialOther) filtersToShow = specialFiltersMap.soup;
  else {
    const selectedMainFilter = Object.keys(relatedFilters).find(k => params.has(k));
    if (selectedMainFilter) filtersToShow = relatedFilters[selectedMainFilter];
    else if (params.has("other") || params.has("bake")) filtersToShow = [];
  }

  filtersToShow.forEach(key => {
    if (params.has(key)) return;

    const label = allFilterCategories[key];
    const select = document.createElement("div");
    select.classList.add("custom-select");
    select.dataset.name = key;
    select.innerHTML = `<div class="selected">${label}</div><ul class="options"></ul>`;

    const values = recipes.map(r => r[key]).flat().filter(Boolean);
    const uniqueValues = [...new Set(values)];

    const optionsList = select.querySelector(".options");
    uniqueValues.forEach(value => {
      const li = document.createElement("li");
      li.textContent = value;
      li.dataset.value = value;
      optionsList.appendChild(li);
    });

    const selected = select.querySelector(".selected");
    selected.addEventListener("click", e => {
      e.stopPropagation();
      select.classList.toggle("open");
    });

    optionsList.querySelectorAll("li").forEach(li => {
      li.addEventListener("click", e => {
        e.stopPropagation();
        params.set(key, li.dataset.value);
        window.location.search = params.toString();
      });
    });

    // ✅ správně přidáváme do innerFilters
    innerFilters.appendChild(select);
  });

  document.addEventListener("click", () => {
    document.querySelectorAll(".custom-select.open").forEach(s => s.classList.remove("open"));
  });

  // === Toggle logika ===
  toggleBtn.addEventListener("click", () => {
    innerFilters.classList.toggle("active");
    toggleBtn.textContent = innerFilters.classList.contains("active")
      ? "Skrýt výběr"
      : "Další výběr";
  });
}

renderFilters();


    // === SWIPE EVENTY (definujeme globálně, ale připojujeme dynamicky) ===
    let touchStartX = 0, touchStartY = 0, touchEndX = 0, touchEndY = 0;
    let isTouching = false;
    let activeSwipeTarget = null;

    function enableSwipe(bookElement) {
      if (window.innerWidth > 768) return; // pouze mobil

      // Odpojit staré posluchače (aby se nehromadily)
      if (activeSwipeTarget) {
        activeSwipeTarget.removeEventListener("touchstart", handleTouchStart);
        activeSwipeTarget.removeEventListener("touchmove", handleTouchMove);
        activeSwipeTarget.removeEventListener("touchend", handleTouchEnd);
      }

      // Nastavit nové
      activeSwipeTarget = bookElement;
      bookElement.addEventListener("touchstart", handleTouchStart, { passive: true });
      bookElement.addEventListener("touchmove", handleTouchMove, { passive: true });
      bookElement.addEventListener("touchend", handleTouchEnd, { passive: true });
    }

    function handleTouchStart(e) {
      if (e.touches.length > 1) return;
      const t = e.target;
      if (t.tagName === "IMG" || t.type === "checkbox" || t.closest("label")) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      isTouching = true;
    }

    function handleTouchMove(e) {
      if (!isTouching) return;
      touchEndX = e.touches[0].clientX;
      touchEndY = e.touches[0].clientY;
    }

    function handleTouchEnd() {
      if (!isTouching) return;
      const dx = touchEndX - touchStartX;
      const dy = touchEndY - touchStartY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 60) {
        if (dx > 0 && currentIndex > 0) renderRecipe(currentIndex - 1);
        else if (dx < 0 && currentIndex < filteredRecipes.length - 1) renderRecipe(currentIndex + 1);
      }
      isTouching = false;
      touchStartX = touchStartY = touchEndX = touchEndY = 0;
    }

    // === Funkce pro vykreslení receptu ===
    function renderRecipe(index) {
      list.innerHTML = "";
      if (!filteredRecipes.length) {
        list.innerHTML = "<p>Žádné recepty pro tento výběr.</p>";
        return;
      }

      currentIndex = index;
      const recipe = filteredRecipes[currentIndex];
      const book = document.createElement("div");
      book.classList.add("recipe-book");


if (window.innerWidth <= 768) {
    book.classList.add("no-line");
}
list.appendChild(book);
      // --- Levá stránka ---
      const leftPage = document.createElement("div");
      leftPage.classList.add("page", "left-page");

      const tagKeys = ["meat", "side", "cuisine", "spicy", "other", "bake"];
      const tagsHTML = tagKeys
        .filter(k => recipe[k])
        .map(k => {
          const vals = Array.isArray(recipe[k]) ? recipe[k] : [recipe[k]];
          return vals.map(v => `<span class="tag" data-key="${k}" data-value="${v}">${v}</span>`).join(" ");
        }).join(" ");

      leftPage.innerHTML = `
        <h2>${recipe.name || "Neznámý recept"}</h2>
        <p class="tags">${tagsHTML}</p>
        <p>${recipe.description || ""}</p>
        ${recipe.ingredients ? `<h3>Suroviny</h3><ul>${recipe.ingredients.map(i => `<li><label><input type="checkbox"> ${i}</label></li>`).join('')}</ul>` : ''}
        ${recipe.instructions ? `<h3>Postup</h3><ol>${recipe.instructions.map(i => `<li><label><input type="checkbox"> ${i}</label></li>`).join('')}</ol>` : ''}
        ${recipe.tips ? `<h3>Tipy</h3><ul>${recipe.tips.map(t => `<li>${t}</li>`).join('')}</ul>` : ''}
      `;
      book.appendChild(leftPage);

      // --- Pravá stránka ---
      const rightPage = document.createElement("div");
      rightPage.classList.add("page", "right-page");
      if (recipe.images && recipe.images[0]) {
        rightPage.style.backgroundImage = `url(${recipe.images[0]})`;
        rightPage.style.backgroundSize = "contain";
        rightPage.style.backgroundRepeat = "no-repeat";
        rightPage.style.backgroundPosition = "center";

        // --- mobilní klik na obrázek ---
        if (window.innerWidth <= 768) {
          rightPage.addEventListener("click", () => {
            window.open(recipe.images[0], "_blank");
          });
        }
      }
      book.appendChild(rightPage);

      // --- Desktop šipky ---
      if (window.innerWidth > 768) {
        const navContainer = document.createElement("div");
        navContainer.classList.add("nav-container");

        const prevBtn = document.createElement("button");
        prevBtn.classList.add("nav-btn");
        prevBtn.textContent = "←";
        prevBtn.addEventListener("click", () => {
          if (currentIndex > 0) renderRecipe(currentIndex - 1);
        });

        const nextBtn = document.createElement("button");
        nextBtn.classList.add("nav-btn");
        nextBtn.textContent = "→";
        nextBtn.addEventListener("click", () => {
          if (currentIndex < filteredRecipes.length - 1) renderRecipe(currentIndex + 1);
        });

        navContainer.appendChild(prevBtn);
        navContainer.appendChild(nextBtn);
        book.appendChild(navContainer);
      }

      // Aktivuj swipe pouze pro aktuální recept
      enableSwipe(book);
    }

    // --- Spustíme první recept ---
    renderRecipe(0);

    // === Klikací tagy ===
    document.addEventListener("click", e => {
      if (e.target.classList.contains("tag")) {
        const key = e.target.dataset.key;
        const value = e.target.dataset.value;
        params.set(key, value);
        window.location.search = params.toString();
      }
    });
  })
  .catch(error => console.error("Chyba při načítání JSON:", error));

  