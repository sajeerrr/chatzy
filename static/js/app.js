const API = {
    auth: {
        login: (data) => fetch('/api/accounts/login/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(r => r.json()),
        register: (data) => fetch('/api/accounts/register/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(r => r.json())
    },
    chats: {
        getRooms: (token) => fetch('/api/chats/my-rooms/', {
            headers: { 'Authorization': `Token ${token}` }
        }).then(r => r.json()),
        createRoom: (token, name) => fetch('/api/chats/create-room/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            },
            body: JSON.stringify({ name: name, participants: [] })
        }).then(r => r.json()),
        getMessages: (token, roomId) => fetch(`/api/chats/room/${roomId}/messages/`, {
            headers: { 'Authorization': `Token ${token}` }
        }).then(r => r.json()),
        sendMessage: (token, data) => fetch('/api/chats/send-message/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            },
            body: JSON.stringify(data)
        }).then(r => r.json())
    }
};

const State = {
    token: localStorage.getItem('chat_token'),
    user: JSON.parse(localStorage.getItem('chat_user')),
    currentRoom: null,
};

// Simple Router
function init() {
    const path = window.location.pathname;
    if (path === '/auth/') {
        if (State.token) window.location.href = '/';
        setupAuth();
    } else if (path === '/') {
        if (!State.token) window.location.href = '/auth/';
        setupChat();
    }
}

function setupAuth() {
    const form = document.querySelector('#auth-form');
    const toggleBtn = document.querySelector('#toggle-auth');
    let isLogin = true;

    toggleBtn.addEventListener('click', () => {
        isLogin = !isLogin;
        document.querySelector('#auth-title').innerText = isLogin ? 'Login to Chatzy' : 'Join Chatzy';
        document.querySelector('#auth-submit').innerText = isLogin ? 'Login' : 'Register';
        toggleBtn.innerText = isLogin ? "Don't have an account? Register" : "Already have an account? Login";
        document.querySelector('#email-group').style.display = isLogin ? 'none' : 'block';
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form));
        const res = await (isLogin ? API.auth.login(data) : API.auth.register(data));

        if (res.token) {
            localStorage.setItem('chat_token', res.token);
            localStorage.setItem('chat_user', JSON.stringify(res.user));
            window.location.href = '/';
        } else {
            alert('Error: ' + JSON.stringify(res));
        }
    });
}

async function setupChat() {
    document.querySelector('#user-name').innerText = State.user.username;

    // Load Rooms
    const rooms = await API.chats.getRooms(State.token);
    const roomList = document.querySelector('#rooms-list');
    roomList.innerHTML = `
        <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
            <input id="new-room-name" placeholder="New room..." style="padding: 0.5rem; font-size: 0.8rem;">
            <button onclick="createRoom()" class="btn" style="padding: 0.5rem 1rem;">+</button>
        </div>
    ` + (rooms.length ? rooms.map(room => `
        <div class="room-item ${State.currentRoom === room.id ? 'active' : ''}" onclick="loadRoom(${room.id}, '${room.name || 'Private Chat'}')">
            ${room.name || 'Private Chat'}
        </div>
    `).join('') : '<p style="color: var(--text-secondary); font-size: 0.8rem; text-align: center;">No rooms found.</p>');

    // Send Message
    document.querySelector('#send-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!State.currentRoom) return;
        const input = document.querySelector('#msg-input');
        const content = input.value;
        if (!content) return;

        await API.chats.sendMessage(State.token, {
            room: State.currentRoom,
            content: content
        });
        input.value = '';
        renderMessages(State.currentRoom);
    });
}

async function loadRoom(id, name) {
    State.currentRoom = id;
    document.querySelector('#current-room-name').innerText = name;

    // Update active state in UI
    document.querySelectorAll('.room-item').forEach(el => {
        el.classList.remove('active');
        if (el.innerText.trim() === name) el.classList.add('active');
    });

    renderMessages(id);
    // Poll for new messages (Simple)
    if (window.chatInterval) clearInterval(window.chatInterval);
    window.chatInterval = setInterval(() => renderMessages(id), 3000);
}

async function createRoom() {
    const input = document.querySelector('#new-room-name');
    const name = input.value;
    if (!name) return;
    const res = await API.chats.createRoom(State.token, name);
    if (res.id) {
        input.value = '';
        setupChat(); // Refresh list
    } else {
        alert('Error creating room: ' + JSON.stringify(res));
    }
}

async function renderMessages(id) {
    const msgs = await API.chats.getMessages(State.token, id);
    const container = document.querySelector('#messages-container');
    container.innerHTML = msgs.map(m => `
        <div class="message ${m.sender === State.user.username ? 'sent' : 'received'}">
            <div class="msg-content">${m.content}</div>
        </div>
    `).join('');
    container.scrollTop = container.scrollHeight;
}

init();
