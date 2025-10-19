// quotes array — each object must have properties `text` and `category`
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" }
];

// Display a random quote — ALX expects function name: showRandomQuote
function showRandomQuote() {
  const display = document.getElementById('quoteDisplay');
  if (!display) return;

  if (!Array.isArray(quotes) || quotes.length === 0) {
    display.textContent = "No quotes available.";
    return;
  }

  // choose a random quote
  const idx = Math.floor(Math.random() * quotes.length);
  const q = quotes[idx];

  // update DOM with quote text and category
  display.textContent = `"${q.text}" — ${q.category}`;
}

// addQuote function — adds a new object to quotes and updates DOM
function addQuote() {
  const textInput = document.getElementById('newQuoteText');
  const catInput = document.getElementById('newQuoteCategory');
  if (!textInput || !catInput) return;

  const text = textInput.value.trim();
  const category = catInput.value.trim();

  if (text === '' || category === '') return;

  // push new quote to array
  quotes.push({ text, category });

  // clear inputs
  textInput.value = '';
  catInput.value = '';

  // update display with newly added quote
  const display = document.getElementById('quoteDisplay');
  if (display) display.textContent = `"${text}" — ${category}`;
}

// Attach event listeners
document.addEventListener('DOMContentLoaded', function () {
  const newQuoteBtn = document.getElementById('newQuote');
  if (newQuoteBtn) newQuoteBtn.addEventListener('click', showRandomQuote);

  const addBtn = document.getElementById('addQuote');
  if (addBtn) addBtn.addEventListener('click', addQuote);

  // show a quote initially
  showRandomQuote();
});
