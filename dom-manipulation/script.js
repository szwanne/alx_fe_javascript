let quotes = [];

function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  quotes = storedQuotes
    ? JSON.parse(storedQuotes)
    : [
        {
          text: "The only limit to our realization of tomorrow is our doubts of today.",
          category: "Motivation",
        },
        {
          text: "Life is what happens when you're busy making other plans.",
          category: "Life",
        },
        { text: "JavaScript is the language of the web.", category: "Tech" },
      ];
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  const quoteDisplay = document.getElementById("quoteDisplay");

  localStorage.setItem("lastCategoryFilter", selectedCategory);

  let filtered = quotes;
  if (selectedCategory !== "all") {
    filtered = quotes.filter((q) => q.category === selectedCategory);
  }

  if (filtered.length > 0) {
    const randomIndex = Math.floor(Math.random() * filtered.length);
    const quote = filtered[randomIndex];
    quoteDisplay.innerHTML = `
      <blockquote>"${quote.text}"</blockquote>
      <p><strong>Category:</strong> ${quote.category}</p>
    `;
    sessionStorage.setItem("lastQuote", JSON.stringify(quote));
  } else {
    quoteDisplay.innerHTML = "<p>No quotes found in this category.</p>";
  }
}

function createAddQuoteForm() {
  const container = document.getElementById("quoteFormContainer");

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.onclick = addQuote;

  container.appendChild(quoteInput);
  container.appendChild(categoryInput);
  container.appendChild(addButton);
}

function addQuote() {
  const newText = document.getElementById("newQuoteText").value.trim();
  const newCategory = document.getElementById("newQuoteCategory").value.trim();

  if (newText && newCategory) {
    quotes.push({ text: newText, category: newCategory });
    saveQuotes();
    populateCategories();

    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
    alert("Quote added successfully!");
  } else {
    alert("Both quote and category are required.");
  }
}

function populateCategories() {
  const categorySet = new Set(quotes.map((q) => q.category));
  const filterDropdown = document.getElementById("categoryFilter");

  filterDropdown.innerHTML = '<option value="all">All Categories</option>';

  categorySet.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    filterDropdown.appendChild(option);
  });

  const lastFilter = localStorage.getItem("lastCategoryFilter");
  if (lastFilter) {
    filterDropdown.value = lastFilter;
    filterQuotes();
  }
}

function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = "quotes.json";
  downloadLink.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid file format.");
      }
    } catch (e) {
      alert("Error reading file: " + e.message);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ✅ FETCH QUOTES FROM MOCK API (JSONPlaceholder)
async function fetchQuotesFromServer() {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts");
  const data = await response.json();

  // Convert first 5 posts into quotes with mock categories
  return data.slice(0, 5).map((post) => ({
    text: post.title,
    category: ["Life", "Tech", "Motivation"][post.id % 3],
  }));
}

// ✅ SYNC + CONFLICT RESOLUTION
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();

  let hasConflict = false;
  const newQuotes = [];

  serverQuotes.forEach((serverQuote) => {
    const localMatch = quotes.find((q) => q.text === serverQuote.text);

    if (!localMatch) {
      newQuotes.push(serverQuote);
    } else if (localMatch.category !== serverQuote.category) {
      Object.assign(localMatch, serverQuote);
      hasConflict = true;
    }
  });

  if (newQuotes.length > 0) {
    quotes.push(...newQuotes);
  }

  if (newQuotes.length > 0 || hasConflict) {
    saveQuotes();
    populateCategories();
    filterQuotes();
    showSyncStatus(
      hasConflict
        ? "Conflicts resolved using server data."
        : "New quotes synced from server."
    );
  }
}

// ✅ UI ALERT FOR SYNC STATUS
function showSyncStatus(message) {
  const statusDiv = document.getElementById("syncStatus");
  statusDiv.textContent = message;
  statusDiv.style.display = "block";

  setTimeout(() => {
    statusDiv.style.display = "none";
  }, 4000);
}

// ✅ INITIALIZATION
window.onload = function () {
  loadQuotes();
  createAddQuoteForm();
  populateCategories();

  document.getElementById("newQuote").addEventListener("click", filterQuotes);

  const lastQuote = sessionStorage.getItem("lastQuote");
  if (lastQuote) {
    const quote = JSON.parse(lastQuote);
    document.getElementById("quoteDisplay").innerHTML = `
      <blockquote>"${quote.text}"</blockquote>
      <p><strong>Category:</strong> ${quote.category}</p>
    `;
  } else {
    filterQuotes();
  }

  function addQuote() {
    const newText = document.getElementById("newQuoteText").value.trim();
    const newCategory = document
      .getElementById("newQuoteCategory")
      .value.trim();

    if (newText && newCategory) {
      const newQuote = { text: newText, category: newCategory };
      quotes.push(newQuote);
      saveQuotes();
      populateCategories();
      postQuoteToServer(newQuote); // ✅ POST to mock server

      document.getElementById("newQuoteText").value = "";
      document.getElementById("newQuoteCategory").value = "";
      alert("Quote added and posted to server!");
    } else {
      alert("Both quote and category are required.");
    }
  }

  // POST a new quote to mock server (simulation)
  async function postQuoteToServer(quote) {
    try {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/posts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(quote),
        }
      );

      const result = await response.json();
      console.log("Quote posted to server (simulated):", result);
      showSyncStatus("Quote posted to server (simulated).");
    } catch (error) {
      console.error("Failed to post quote:", error);
      showSyncStatus("Error posting quote to server.");
    }
  }

  // Initial sync and schedule periodic sync
  syncQuotes();
  setInterval(syncQuotes, 30000);
};
