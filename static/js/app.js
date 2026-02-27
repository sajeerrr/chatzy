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
        }).then(r => r.json()),
        getUsers: (token, query = '') => fetch(`/api/accounts/users/?q=${query}`, {
            headers: { 'Authorization': `Token ${token}` }
        }).then(r => r.json())
    },
    chats: {
        getRooms: (token) => fetch('/api/chats/my-rooms/', {
            headers: { 'Authorization': `Token ${token}` }
        }).then(r => r.json()),
        createRoom: (token, data) => fetch('/api/chats/create-room/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            },
            body: JSON.stringify(data)
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
    selectedParticipants: []
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

    if (!form) return;

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
    if (!State.user) {
        localStorage.clear();
        window.location.href = '/auth/';
        return;
    }
    document.querySelector('#user-name').innerText = State.user.username;

    // Load Rooms
    loadRoomList();

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

async function loadRoomList() {
    const rooms = await API.chats.getRooms(State.token);
    const roomList = document.querySelector('#rooms-list');
    if (!roomList) return;

    roomList.innerHTML = (rooms.length ? rooms.map(room => `
        <div class="room-item ${State.currentRoom === room.id ? 'active' : ''}" onclick="loadRoom(${room.id}, '${room.name || 'Private Chat'}')">
            ${room.name || 'Private Chat'}
        </div>
    `).join('') : '<p style="color: var(--text-secondary); font-size: 0.8rem; text-align: center; margin-top: 1rem;">No conversations yet.</p>');
}

async function loadRoom(id, name) {
    State.currentRoom = id;
    document.querySelector('#current-room-name').innerText = name;

    document.querySelectorAll('.room-item').forEach(el => {
        el.classList.remove('active');
        if (el.innerText.trim() === name) el.classList.add('active');
    });

    renderMessages(id);
    if (window.chatInterval) clearInterval(window.chatInterval);
    window.chatInterval = setInterval(() => renderMessages(id), 3000);
}

async function renderMessages(id) {
    const msgs = await API.chats.getMessages(State.token, id);
    const container = document.querySelector('#messages-container');
    if (!container) return;

    container.innerHTML = msgs.map(m => `
        <div class="message ${m.sender === State.user.username ? 'sent' : 'received'}">
            <div class="msg-content">${m.content}</div>
        </div>
    `).join('');
    container.scrollTop = container.scrollHeight;
}

// Modal Functions
function showCreateRoomModal() {
    document.querySelector('#create-room-modal').style.display = 'flex';
    State.selectedParticipants = [];
    renderParticipants();
}

function hideCreateRoomModal() {
    document.querySelector('#create-room-modal').style.display = 'none';
    document.querySelector('#modal-room-name').value = '';
    document.querySelector('#user-search').value = '';
    document.querySelector('#user-search-results').innerHTML = '';
}

async function searchUsers(q) {
    if (!q) {
        document.querySelector('#user-search-results').innerHTML = '';
        return;
    }
    const users = await API.auth.getUsers(State.token, q);
    const results = document.querySelector('#user-search-results');
    results.innerHTML = users.map(u => `
        <div class="search-item" onclick="selectUser(${u.id}, '${u.username}')">
            ${u.username}
        </div>
    `).join('');
}

function selectUser(id, username) {
    if (State.selectedParticipants.find(p => p.id === id)) return;
    State.selectedParticipants.push({ id, username });
    renderParticipants();
    document.querySelector('#user-search').value = '';
    document.querySelector('#user-search-results').innerHTML = '';
}

function renderParticipants() {
    const container = document.querySelector('#selected-participants');
    container.innerHTML = State.selectedParticipants.map(p => `
        <div class="tag">
            ${p.username}
            <span onclick="removeUser(${p.id})">&times;</span>
        </div>
    `).join('');
}

function removeUser(id) {
    State.selectedParticipants = State.selectedParticipants.filter(p => p.id !== id);
    renderParticipants();
}

async function submitCreateRoom() {
    const name = document.querySelector('#modal-room-name').value;
    if (!name && State.selectedParticipants.length === 0) return;

    const data = {
        name: name,
        participants: State.selectedParticipants.map(p => p.id),
        is_group: State.selectedParticipants.length > 1
    };

    const res = await API.chats.createRoom(State.token, data);
    if (res.id) {
        hideCreateRoomModal();
        loadRoomList();
        loadRoom(res.id, res.name || 'New Chat');
    } else {
        alert('Error: ' + JSON.stringify(res));
    }
}

init();
