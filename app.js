// Обработка состояния онлайн/офлайн
function updateOnlineStatus() {
    const offlineIndicator = document.getElementById('offlineIndicator');
    if (navigator.onLine) {
        offlineIndicator.style.display = 'none';
    } else {
        offlineIndicator.style.display = 'block';
    }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Вызываем сразу для установки начального состояния
updateOnlineStatus();

// Работа с заметками
let notes = [];
let currentEditId = null;

// Загрузка заметок из localStorage
function loadNotes() {
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
        notes = JSON.parse(savedNotes);
        renderNotes();
    }
}

// Сохранение заметок в localStorage
function saveNotes() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

// Добавление новой заметки
function addNote() {
    const noteInput = document.getElementById('noteInput');
    const content = noteInput.value.trim();
    
    if (content) {
        const newNote = {
            id: Date.now().toString(),
            content: content,
            timestamp: new Date().toLocaleString()
        };
        
        notes.unshift(newNote); // Добавляем в начало массива
        saveNotes();
        renderNotes();
        noteInput.value = '';
    }
}

// Удаление заметки
function deleteNote(id) {
    notes = notes.filter(note => note.id !== id);
    saveNotes();
    renderNotes();
    
    // Если удаляем заметку, которую редактировали, сбрасываем режим редактирования
    if (currentEditId === id) {
        exitEditMode();
    }
}

// Вход в режим редактирования
function enterEditMode(id) {
    const note = notes.find(note => note.id === id);
    if (note) {
        currentEditId = id;
        
        const noteInput = document.getElementById('noteInput');
        noteInput.value = note.content;
        
        document.getElementById('addNote').style.display = 'none';
        document.getElementById('updateNote').style.display = 'block';
        document.getElementById('cancelEdit').style.display = 'block';
        
        // Прокрутим к форме ввода
        noteInput.focus();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Выход из режима редактирования
function exitEditMode() {
    currentEditId = null;
    
    const noteInput = document.getElementById('noteInput');
    noteInput.value = '';
    
    document.getElementById('addNote').style.display = 'block';
    document.getElementById('updateNote').style.display = 'none';
    document.getElementById('cancelEdit').style.display = 'none';
}

// Обновление заметки
function updateNote() {
    if (currentEditId) {
        const noteInput = document.getElementById('noteInput');
        const content = noteInput.value.trim();
        
        if (content) {
            const noteIndex = notes.findIndex(note => note.id === currentEditId);
            if (noteIndex !== -1) {
                notes[noteIndex].content = content;
                notes[noteIndex].timestamp = new Date().toLocaleString() + ' (ред.)';
                saveNotes();
                renderNotes();
                exitEditMode();
            }
        }
    }
}

// Отображение заметок
function renderNotes() {
    const container = document.getElementById('notesContainer');
    container.innerHTML = '';
    
    if (notes.length === 0) {
        container.innerHTML = '<div class="no-notes">Нет заметок. Добавьте первую заметку!</div>';
        return;
    }
    
    notes.forEach(note => {
        const noteCard = document.createElement('div');
        noteCard.className = 'note-card';
        noteCard.innerHTML = `
            <div class="note-content">${formatContent(note.content)}</div>
            <div class="note-footer">
                <div class="timestamp">${note.timestamp}</div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn-edit" data-id="${note.id}">Редактировать</button>
                    <button class="btn-delete" data-id="${note.id}">Удалить</button>
                </div>
            </div>
        `;
        container.appendChild(noteCard);
    });
    
    // Добавляем обработчики событий для кнопок
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            if (confirm('Вы уверены, что хотите удалить эту заметку?')) {
                deleteNote(id);
            }
        });
    });
    
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            enterEditMode(id);
        });
    });
}

// Форматирование текста заметки (экранирование HTML и поддержка переносов строк)
function formatContent(content) {
    return content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/\n/g, '<br>');
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    loadNotes();
    
    // Обработчики событий для кнопок
    document.getElementById('addNote').addEventListener('click', addNote);
    document.getElementById('updateNote').addEventListener('click', updateNote);
    document.getElementById('cancelEdit').addEventListener('click', exitEditMode);
    
    // Обработчик нажатия Enter в текстовом поле
    document.getElementById('noteInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            if (currentEditId) {
                updateNote();
            } else {
                addNote();
            }
        }
    });
});

// Регистрация Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('ServiceWorker успешно зарегистрирован:', registration.scope);
            })
            .catch(error => {
                console.log('Ошибка регистрации ServiceWorker:', error);
            });
    });
}