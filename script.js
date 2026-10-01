// --- Firebase Config (Insert your free Firebase project credentials here) ---
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
if (typeof firebase !== "undefined") {
    firebase.initializeApp(firebaseConfig);
}
const database = typeof firebase !== "undefined" ? firebase.database() : null;

// Window Z-Index Stack Tracker
let selectedIcon = undefined;
let biggestIndex = 20;

// --- Window Dragging Logic ---
function makeDraggable(element) {
    let initialX = 0, initialY = 0, currentX = 0, currentY = 0;

    const header = document.getElementById(element.id + "header") || element;
    header.onmousedown = startDragging;

    function startDragging(e) {
        e = e || window.event;
        e.preventDefault();

        bringToFront(element);

        initialX = e.clientX;
        initialY = e.clientY;

        document.onmouseup = stopDragging;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();

        currentX = initialX - e.clientX;
        currentY = initialY - e.clientY;
        initialX = e.clientX;
        initialY = e.clientY;

        element.style.top = (element.offsetTop - currentY) + "px";
        element.style.left = (element.offsetLeft - currentX) + "px";
    }

    function stopDragging() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function bringToFront(element) {
    biggestIndex++;
    element.style.zIndex = biggestIndex;
}

function openWindow(element) {
    if (element) {
        element.style.display = "flex";
        bringToFront(element);
    }
}

function closeWindow(element) {
    if (element) {
        element.style.display = "none";
    }
}

// --- Desktop Icon Actions ---
function selectIcon(element) {
    if (selectedIcon) selectedIcon.classList.remove("selected");
    element.classList.add("selected");
    selectedIcon = element;
}

function deselectIcon() {
    if (selectedIcon) {
        selectedIcon.classList.remove("selected");
        selectedIcon = undefined;
    }
}

function handleIconTap(element, targetWindow) {
    if (element.classList.contains("selected")) {
        deselectIcon();
        openWindow(targetWindow);
    } else {
        selectIcon(element);
    }
}

// --- Real-time Firebase Database Listeners ---
function initRealtimeDiary() {
    const postBtn = document.getElementById("postNoteBtn");
    const authorInput = document.getElementById("authorInput");
    const noteInput = document.getElementById("noteInput");
    const notesContainer = document.getElementById("notesContent");

    if (!database) {
        if (notesContainer) {
            notesContainer.innerHTML = "<p style='font-size: 12px; color: #444;'>Add your Firebase config in script.js to enable live notes!</p>";
        }
        return;
    }

    // 1. Post a new note to Firebase
    if (postBtn) {
        postBtn.addEventListener("click", () => {
            const author = authorInput.value.trim() || "Anonymous";
            const text = noteInput.value.trim();

            if (text === "") {
                alert("Please type a message before posting!");
                return;
            }

            database.ref("diary_notes").push({
                author: author,
                text: text,
                timestamp: Date.now()
            });

            noteInput.value = "";
        });
    }

    // 2. Listen live for new updates from all visitors
    database.ref("diary_notes").on("value", (snapshot) => {
        notesContainer.innerHTML = "";
        const data = snapshot.val();

        if (!data) {
            notesContainer.innerHTML = "<p style='font-size: 12px; color: #444;'>No notes yet! Be the first to post something.</p>";
            return;
        }

        Object.values(data).reverse().forEach((note) => {
            const card = document.createElement("div");
            card.className = "note-card";
            card.innerHTML = `
                <p class="note-card-author">${escapeHTML(note.author)}</p>
                <p class="note-card-text">${escapeHTML(note.text)}</p>
            `;
            notesContainer.appendChild(card);
        });
    });
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

// --- Page Initialization ---
window.addEventListener("DOMContentLoaded", () => {
    // Enable dragging for windows
    ["box-1", "box-2", "box-3", "welcome", "notes"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
            makeDraggable(el);
            el.addEventListener("mousedown", () => bringToFront(el));

            const closeBtn = document.getElementById(id + "header");
            if (closeBtn) {
                closeBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    closeWindow(el);
                });
            }
        }
    });

    // Real-Time Clock
    function updateClock() {
        const timeEl = document.getElementById("timeElement");
        if (timeEl) {
            timeEl.textContent = new Date().toLocaleTimeString();
        }
    }
    updateClock();
    setInterval(updateClock, 1000);

    // Welcome Window Controls
    const welcomeScreen = document.querySelector("#welcome");
    const welcomeScreenClose = document.querySelector("#welcomeclose");
    const welcomeScreenOpen = document.querySelector("#welcomeopen");

    if (welcomeScreenClose && welcomeScreen) {
        welcomeScreenClose.addEventListener("click", () => closeWindow(welcomeScreen));
    }
    if (welcomeScreenOpen && welcomeScreen) {
        welcomeScreenOpen.addEventListener("click", () => openWindow(welcomeScreen));
    }

    // Desktop Icon Controls
    const desktopApps = document.querySelector("#desktopApps");
    const notesWindow = document.querySelector("#notes");

    if (desktopApps && notesWindow) {
        desktopApps.addEventListener("click", (e) => {
            e.stopPropagation();
            handleIconTap(desktopApps, notesWindow);
        });
    }

    document.body.addEventListener("click", () => deselectIcon());

    // Initialize Database
    initRealtimeDiary();
});