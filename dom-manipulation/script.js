// Initial array of quotes
let quotes = [
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

// Function to show a random quote
function showRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  quoteDisplay.innerHTML = `
    <blockquote>"${quote.text}"</blockquote>
    <p><strong>Category:</strong> ${quote.category}</p>
  `;
}

// Function to add a new quote from form inputs
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const newText = textInput.value.trim();
  const newCategory = categoryInput.value.trim();

  if (newText && newCategory) {
    // Add the new quote to the array
    quotes.push({ text: newText, category: newCategory });

    // Optionally clear input fields
    textInput.value = "";
    categoryInput.value = "";

    alert("New quote added!");
  } else {
    alert("Please enter both quote text and category.");
  }
}

// Bind the "Show New Quote" button
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// Optional: Show a random quote when the page loads
window.onload = showRandomQuote;
