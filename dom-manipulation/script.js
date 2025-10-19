// ==========================
// Combined Comprehensive Quote Manager
// ==========================

/* -------------------------
   Config / Keys
   ------------------------- */
const LOCAL_KEY = 'dq_quotes_v1';
const FILTER_KEY = 'dq_last_filter';
const LAST_VIEWED_KEY = 'dq_last_viewed';

/* -------------------------
   In-memory data
   ------------------------- */
let quotes = [];

/* -------------------------
   Helper Functions
   ------------------------- */
function $id(id) { return document.getElementById(id); }
function nowIso() { return new Date().toISOString(); }
function genId() { return 'q_' + Math.random().toString(36).slice(2, 9); }
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}

/* -------------------------
   Persistence: save/load
   ------------------------- */
function saveQuotes() {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(quotes));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

function loadQuotes() {
  const storedQuotes = localStorage.getItem(LOCAL_KEY);
  if (storedQuotes) {
    try {
      const parsed = JSON.parse(storedQuotes);
      if (Array.isArray(parsed)) {
        quotes = parsed;
        return;
      }
    } catch (e) {
      console.warn('Invalid JSON in localStorage, will seed defaults', e);
    }
  }
  // Seed defaults if nothing valid in storage
  quotes = [
    { id: genId(), text: "The journey of a thousand miles begins with one step.", category: "Motivation", updatedAt: nowIso() },
    { id: genId(), text: "Life is what happens when you're busy making other plans.", category: "Life", updatedAt: nowIso() },
    { id: genId(), text: "You miss 100% of the shots you don't take.", category: "Sports", updatedAt: nowIso() },
    { id: genId(), text: "The best way to predict the future is to create it.", category: "Motivation", updatedAt: nowIso() },
    { id: genId(), text: "In the middle of difficulty lies opportunity.", category: "Inspiration", updatedAt: nowIso() }
  ];
  saveQuotes();
}

/* -------------------------
   Display Random Quote
   ------------------------- */
function displayRandomQuote() {
  const display = $id('quoteDisplay');
  if (!display) return;
  
  if (!Array.isArray(quotes) || quotes.length === 0) {
    display.innerHTML = '<p>No quotes available.</p>';
    return;
  }

  const filter = localStorage.getItem(FILTER_KEY) || 'all';
  const pool = filter === 'all' ? quotes : quotes.filter(q => q.category === filter);

  if (!pool.length) {
    display.innerHTML = '<p>No quotes for this category.</p>';
    return;
  }

  const randomIndex = Math.floor(Math.random() * pool.length);
  const quote = pool[randomIndex];

  // Save last viewed quote in session storage
  try { 
    sessionStorage.setItem(LAST_VIEWED_KEY, JSON.stringify(quote));
  } catch(e) {}

  display.innerHTML = `
    <div>
      <p><strong>Quote:</strong> ${escapeHtml(quote.text)}</p>
      <p><em>Category:</em> ${escapeHtml(quote.category)}</p>
      <p style="font-size:.8rem;color:#666">Updated: ${new Date(quote.updatedAt).toLocaleString()}</p>
    </div>
  `;
}

// Alias for compatibility
function showRandomQuote() {
  displayRandomQuote();
}

/* -------------------------
   Add New Quote
   ------------------------- */
function addQuote() {
  const textEl = $id('newQuoteText');
  const catEl = $id('newQuoteCategory');
  
  if (!textEl || !catEl) return;

  const text = textEl.value.trim();
  const category = catEl.value.trim() || 'Uncategorized';

  if (!text || !category) {
    alert("Please fill both fields.");
    return;
  }

  const newQuote = { 
    id: genId(), 
    text: text, 
    category: category, 
    updatedAt: nowIso() 
  };
  
  quotes.push(newQuote);
  saveQuotes();
  
  // Update UI
  displayRandomQuote();
  populateCategories();
  renderQuoteList();
  
  // Clear inputs
  textEl.value = "";
  catEl.value = "";
}

/* -------------------------
   Dynamic Form Creation
   ------------------------- */
function createAddQuoteForm() {
  const container = $id('dynamicAddContainer');
  if (!container) return;
  container.innerHTML = ''; // reset

  const txt = document.createElement('input');
  txt.type = 'text';
  txt.id = 'dynQuoteText';
  txt.placeholder = 'Dynamic: Enter quote text';
  txt.style.marginRight = '8px';

  const cat = document.createElement('input');
  cat.type = 'text';
  cat.id = 'dynQuoteCategory';
  cat.placeholder = 'Dynamic: Enter category';
  cat.style.marginRight = '8px';

  const btn = document.createElement('button');
  btn.id = 'dynAddBtn';
  btn.textContent = 'Add (Dynamic)';

  btn.addEventListener('click', function () {
    const text = txt.value.trim();
    const category = cat.value.trim() || 'Uncategorized';
    if (!text) { alert('Enter text'); return; }
    
    const newQuote = { 
      id: genId(), 
      text: text, 
      category: category, 
      updatedAt: nowIso() 
    };
    
    quotes.push(newQuote);
    saveQuotes();
    populateCategories();
    renderQuoteList();
    
    txt.value = '';
    cat.value = '';
    $id('quoteDisplay').innerHTML = `
      <p><strong>Quote:</strong> ${escapeHtml(newQuote.text)}</p>
      <p><em>Category:</em> ${escapeHtml(newQuote.category)}</p>
    `;
  });

  container.appendChild(txt);
  container.appendChild(cat);
  container.appendChild(btn);
}

/* -------------------------
   List Rendering with Delete
   ------------------------- */
function renderQuoteList() {
  const listDiv = $id('quoteList');
  if (!listDiv) return;
  
  listDiv.innerHTML = '';
  const selectedCategory = localStorage.getItem(FILTER_KEY) || 'all';
  const filtered = selectedCategory === 'all' 
    ? quotes 
    : quotes.filter(q => q.category === selectedCategory);

  if (filtered.length === 0) {
    listDiv.innerHTML = '<p>No quotes to show.</p>';
    return;
  }

  filtered.forEach(quote => {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.justifyContent = 'space-between';
    row.style.alignItems = 'center';
    row.style.padding = '8px 0';
    row.innerHTML = `
      <div style="max-width:75%">
        <div><strong>"${escapeHtml(quote.text)}"</strong></div>
        <div style="font-size:.85rem;color:#666">
          ${escapeHtml(quote.category)} • ${new Date(quote.updatedAt).toLocaleString()}
        </div>
      </div>
      <div>
        <button class="secondary" data-id="${quote.id}" data-action="delete">Delete</button>
      </div>
    `;
    listDiv.appendChild(row);
  });

  // Add delete handlers
  listDiv.querySelectorAll('button[data-action="delete"]').forEach(btn => {
    btn.addEventListener('click', function () {
      const id = this.getAttribute('data-id');
      if (!confirm('Delete this quote?')) return;
      quotes = quotes.filter(q => q.id !== id);
      saveQuotes();
      populateCategories();
      renderQuoteList();
      displayRandomQuote();
    });
  });
}

/* -------------------------
   Categories & Filtering
   ------------------------- */
function populateCategories() {
  const select = $id('categoryFilter');
  if (!select) return;
  
  const selectedCategory = localStorage.getItem(FILTER_KEY) || 'all';

  // Clear and rebuild options
  select.innerHTML = '<option value="all">All Categories</option>';
  const categories = [...new Set(quotes.map(q => q.category))].sort();
  
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    if (cat === selectedCategory) option.selected = true;
    select.appendChild(option);
  });

  localStorage.setItem(FILTER_KEY, selectedCategory);
  filterQuotes();
}

function filterQuotes() {
  const select = $id('categoryFilter');
  if (!select) return;
  
  const selectedCategory = select.value;
  localStorage.setItem(FILTER_KEY, selectedCategory);
  renderQuoteList();
  displayRandomQuote();
}

/* -------------------------
   JSON Import / Export
   ------------------------- */
function exportToJson() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (!Array.isArray(importedQuotes)) throw new Error('Imported JSON must be an array');
      
      importedQuotes.forEach(item => {
        if (!item.id) item.id = genId();
        if (!item.updatedAt) item.updatedAt = nowIso();
        if (!item.text) item.text = '';
        if (!item.category) item.category = 'Uncategorized';
        
        // Update existing or add new
        const existingIndex = quotes.findIndex(q => q.id === item.id);
        if (existingIndex >= 0) {
          quotes[existingIndex] = item;
        } else {
          quotes.push(item);
        }
      });
      
      saveQuotes();
      populateCategories();
      renderQuoteList();
      alert("Quotes imported successfully!");
    } catch (err) {
      alert('Import failed: ' + err.message);
      console.error(err);
    } finally {
      // Clear input for re-selection
      event.target.value = '';
    }
  };
  reader.readAsText(file);
}

/* -------------------------
   Server Sync with Conflict Resolution
   ------------------------- */
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
    if (!response.ok) throw new Error('Network response not ok');
    const data = await response.json();
    // Map mock data to quotes
    const serverQuotes = data.map(d => ({ 
      id: 'srv_' + d.id,
      text: d.title, 
      category: "Server",
      updatedAt: nowIso()
    }));
    return serverQuotes;
  } catch (err) {
    console.error("Error fetching from server:", err);
    return [];
  }
}

async function syncQuotes() {
  const status = $id('syncStatus');
  if (status) status.textContent = 'Syncing...';
  
  try {
    const serverQuotes = await fetchQuotesFromServer();
    let updated = false;
    const conflicts = [];

    serverQuotes.forEach(serverQuote => {
      const existingIndex = quotes.findIndex(q => q.id === serverQuote.id);
      
      if (existingIndex === -1) {
        // New quote from server
        quotes.push(serverQuote);
        updated = true;
      } else {
        // Conflict resolution: server-wins policy
        const localQuote = quotes[existingIndex];
        if (new Date(serverQuote.updatedAt) > new Date(localQuote.updatedAt) || 
            serverQuote.text !== localQuote.text) {
          conflicts.push({ id: serverQuote.id, server: serverQuote, local: localQuote });
          quotes[existingIndex] = serverQuote;
          updated = true;
        }
      }
    });

    if (updated) {
      saveQuotes();
      populateCategories();
      renderQuoteList();
      
      if (conflicts.length > 0) {
        console.warn('Conflicts resolved (server-wins):', conflicts);
        if (status) {
          status.textContent = `Synced: ${conflicts.length} conflict(s) resolved`;
        }
        alert(`${conflicts.length} conflict(s) resolved using server-wins strategy.`);
      } else {
        if (status) status.textContent = "Quotes synced with server!";
      }
    } else {
      if (status) status.textContent = "No updates needed";
    }

    setTimeout(() => {
      if (status) status.textContent = "";
    }, 3000);

  } catch (err) {
    console.error('Sync failed', err);
    if (status) status.textContent = 'Sync failed';
    setTimeout(() => {
      if (status) status.textContent = "";
    }, 3000);
  }
}

// Alias for compatibility
function syncWithServer() {
  syncQuotes();
}

/* -------------------------
   Initialization
   ------------------------- */
function init() {
  // Load quotes from localStorage
  loadQuotes();
  
  // Initialize UI
  populateCategories();
  renderQuoteList();
  
  // Display initial quote (check session storage first)
  const lastViewed = sessionStorage.getItem(LAST_VIEWED_KEY);
  if (lastViewed) {
    try {
      const quote = JSON.parse(lastViewed);
      $id('quoteDisplay').innerHTML = `
        <p><strong>Quote:</strong> ${escapeHtml(quote.text)}</p>
        <p><em>Category:</em> ${escapeHtml(quote.category)}</p>
      `;
    } catch (e) {
      displayRandomQuote();
    }
  } else {
    displayRandomQuote();
  }
  
  // Event Listeners
  const newBtn = $id('newQuote'); 
  if (newBtn) newBtn.addEventListener('click', displayRandomQuote);
  
  const addBtn = $id('addQuote'); 
  if (addBtn) addBtn.addEventListener('click', addQuote);
  
  const exportBtn = $id('exportBtn'); 
  if (exportBtn) exportBtn.addEventListener('click', exportToJson);
  
  const importFile = $id('importFile'); 
  if (importFile) importFile.addEventListener('change', importFromJsonFile);
  
  const filter = $id('categoryFilter'); 
  if (filter) filter.addEventListener('change', filterQuotes);
  
  const syncBtn = $id('syncBtn'); 
  if (syncBtn) syncBtn.addEventListener('click', syncQuotes);
  
  const dynContainer = $id('dynamicAddContainer'); 
  if (dynContainer) createAddQuoteForm();
  
  // Optional: periodic server sync every 30s
  setInterval(syncQuotes, 30000);
}

// Initialize the application
init();