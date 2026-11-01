function runClock() {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();

    const hDeg = (h % 12) * 30 + m * 0.5;
    const mDeg = m * 6;
    const sDeg = s * 6;

    const hHand = document.getElementById('hHand');
    const mHand = document.getElementById('mHand');
    const sHand = document.getElementById('sHand');

    if (hHand) hHand.style.transform = `translateX(-50%) rotate(${hDeg}deg)`;
    if (mHand) mHand.style.transform = `translateX(-50%) rotate(${mDeg}deg)`;
    if (sHand) sHand.style.transform = `translateX(-50%) rotate(${sDeg}deg)`;

    const digClock = document.getElementById('digClock');
    if (digClock) digClock.innerText = now.toLocaleTimeString();

    if (window.alarmTime && window.alarmOn) {
        const cur = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        if (cur === window.alarmTime && s === 0) {
            alert('alarm ringing');
            window.alarmOn = false;
            const msg = document.getElementById('alarmMsg');
            if (msg) msg.innerText = '';
        }
    }
}
setInterval(runClock, 1000);
runClock();

loadNotes();

function saveNote() {
    const box = document.getElementById('diaryText');
    if (!box) return;
    const val = box.value.trim();
    if (!val) return;

    let list = JSON.parse(localStorage.getItem('my_notes') || '[]');
    list.unshift({ text: val, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    localStorage.setItem('my_notes', JSON.stringify(list));

    box.value = '';
    loadNotes();

    const stat = document.getElementById('statusText');
    if (stat) {
        stat.innerText = 'saved';
        setTimeout(() => stat.innerText = 'ready', 1500);
    }
}

function loadNotes() {
    let list = JSON.parse(localStorage.getItem('my_notes') || '[]');
    const notesList = document.getElementById('notesList');
    if (notesList) {
        notesList.innerHTML = list.slice(0, 4).map(n => `<div class="note-item">${n.text}</div>`).join('');
    }
}

function setAlarm() {
    const timeInput = document.getElementById('alarmInput');
    if (!timeInput) return;
    const time = timeInput.value;
    if (!time) return;
    window.alarmTime = time;
    window.alarmOn = true;
    const msg = document.getElementById('alarmMsg');
    if (msg) msg.innerText = `alarm set for ${time}`;
}

let expr = '0';

function refreshCalc() {
    const screen = document.getElementById('calcScreen');
    if (screen) screen.innerText = expr;
}

function pressKey(val) {
    if (expr === '0' && val !== '.') {
        expr = val;
    } else {
        expr += val;
    }
    refreshCalc();
}

function pressAC() {
    expr = '0';
    refreshCalc();
}

function pressEq() {
    try {
        expr = eval(expr).toString();
    } catch (err) {
        expr = 'error';
    }
    refreshCalc();
}

    