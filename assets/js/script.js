// ==================== DAFTAR MATERI FISIKA (100+ MATERI) ====================
const materiList = [
    "Besaran dan satuan", "Vektor", "Kinematika", "Gerak lurus", "Gerak parabola",
    "Gerak melingkar", "Hukum Newton", "Gaya gesek", "Usaha dan energi", "Momentum",
    "Tumbukan", "Rotasi benda tegar", "Gravitasi", "Elastisitas", "Fluida statis",
    "Fluida dinamis", "Termodinamika", "Gas ideal", "Kalor", "Gelombang mekanik",
    "Gelombang bunyi", "Efek Doppler", "Cahaya", "Optik geometri", "Alat optik",
    "Listrik statis", "Medan listrik", "Kapasitor", "Listrik dinamis", "Hukum Ohm",
    "Rangkaian listrik", "Medan magnet", "Induksi elektromagnetik", "Transformator", "Gelombang elektromagnetik",
    "Relativitas khusus", "Fisika kuantum", "Efek fotolistrik", "Model atom", "Radioaktivitas",
    "Fisika inti", "Astrofisika", "Kosmologi", "Black Hole", "String theory",
    "Lubang hitam", "Ruang-waktu", "Hawking radiation", "Big Bang", "Materi gelap",
    "Energi gelap", "Multiverse", "Gravitasi kuantum", "Loop quantum gravity", "Supersimetri",
    "Partikel elementer", "Quark", "Lepton", "Boson Higgs", "Mekanika kuantum",
    "Fungsi gelombang", "Persamaan Schrödinger", "Prinsip ketidakpastian", "Quantum entanglement", "Quantum computing",
    "Nanoteknologi", "Semikonduktor", "Superkonduktor", "Fotonik", "Plasma",
    "Fusi nuklir", "Fisi nuklir", "Reaktor nuklir", "Akselerator", "Detektor partikel",
    "Radiasi", "Dosis radiasi", "Proteksi radiasi", "Biofisika", "Fisika medis",
    "Instrumentasi", "Robotika", "Mekatronika", "Sistem kontrol", "Kecerdasan buatan dalam fisika",
    "Simulasi fisika", "Komputasi fisika", "Machine learning fisika", "Data science fisika", "Big data fisika"
];

// ==================== VARIABLES ====================
let userName = localStorage.getItem('obscura_name') || 'Pengguna';
let allGroups = {};
let currentGroup = null;
let isAdmin = false;
let cart = [];
let speakInterval = null;
let currentMateri = null;
let searchTimeout = null;

// ==================== LOAD/SAVE ====================
function loadGroups() {
    const saved = localStorage.getItem('obscura_groups');
    if (saved) allGroups = JSON.parse(saved);
}

function saveGroups() {
    localStorage.setItem('obscura_groups', JSON.stringify(allGroups));
}

// ==================== PARTICIPANTS DISPLAY ====================
function renderParticipants() {
    const container = document.getElementById('participantsGrid');
    const countSpan = document.getElementById('participantCount');
    const leaveBtn = document.getElementById('leaveCallBtn');
    
    if (!currentGroup || !currentGroup.participants || currentGroup.participants.length === 0) {
        container.innerHTML = `<div class="empty-participants"><i class="fas fa-microphone-slash"></i><p>Belum ada peserta</p><span>Buat atau gabung group call</span></div>`;
        if (countSpan) countSpan.textContent = '0';
        if (leaveBtn) leaveBtn.style.display = 'none';
        return;
    }
    
    if (leaveBtn) leaveBtn.style.display = 'block';
    if (countSpan) countSpan.textContent = currentGroup.participants.length;
    
    let html = '';
    currentGroup.participants.forEach(p => {
        const initial = p.name.charAt(0).toUpperCase();
        html += `
            <div class="participant-card ${p.isSpeaking ? 'speaking' : ''}">
                <div class="participant-avatar">${initial}</div>
                <div class="participant-name">${p.name} ${p.isHost ? '👑' : ''}</div>
                <button class="mic-btn ${p.muted ? 'muted' : ''}" onclick="toggleMute('${p.name}')">
                    <i class="fas ${p.muted ? 'fa-microphone-slash' : 'fa-microphone'}"></i>
                </button>
            </div>
        `;
    });
    container.innerHTML = html;
}

function toggleMute(personName) {
    if (!currentGroup) return;
    const p = currentGroup.participants.find(p => p.name === personName);
    if (p) {
        p.muted = !p.muted;
        if (p.muted && p.isSpeaking) p.isSpeaking = false;
        saveGroups();
        renderParticipants();
        showToast(`${p.name} ${p.muted ? 'mematikan mic' : 'menyalakan mic'}`);
    }
}

function startSpeakingSim() {
    if (speakInterval) clearInterval(speakInterval);
    speakInterval = setInterval(() => {
        if (currentGroup && currentGroup.participants && currentGroup.participants.length > 0) {
            currentGroup.participants.forEach(p => p.isSpeaking = false);
            const active = currentGroup.participants.filter(p => !p.muted);
            if (active.length > 0) {
                const random = active[Math.floor(Math.random() * active.length)];
                random.isSpeaking = true;
                renderParticipants();
                setTimeout(() => {
                    if (currentGroup) {
                        currentGroup.participants.forEach(p => p.isSpeaking = false);
                        renderParticipants();
                    }
                }, 2000);
            }
        }
    }, 8000);
}

// ==================== GROUP CALL FUNCTIONS ====================
function createGroup(type) {
    if (!currentMateri) {
        showToast('Pilih materi terlebih dahulu!');
        return;
    }
    
    if (type === 'bdl' && !isAdmin) {
        showToast('Hanya admin yang bisa membuat BDL! Klik logo 5x');
        return;
    }
    
    const groups = allGroups[currentMateri] || [];
    const maxSize = type === 'sml' ? 5 : Infinity;
    
    const newGroup = {
        id: Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        name: `${type === 'sml' ? 'SML' : 'BDL'} - ${currentMateri}`,
        type: type,
        participants: [{ name: userName, isHost: true, muted: false, isSpeaking: false }],
        maxSize: maxSize,
        materi: currentMateri
    };
    
    groups.push(newGroup);
    allGroups[currentMateri] = groups;
    saveGroups();
    
    currentGroup = newGroup;
    renderGroupsList();
    renderParticipants();
    startSpeakingSim();
    
    showToast(`✅ Group ${newGroup.name} dibuat`);
    addSystemMessage(`🎙️ Group call "${newGroup.name}" dimulai! Maksimal ${maxSize === 5 ? '5 orang' : 'tanpa batas'}.`);
}

function joinGroup(groupId) {
    if (!currentMateri) return;
    const groups = allGroups[currentMateri] || [];
    const group = groups.find(g => g.id === groupId);
    if (!group) return;
    
    if (group.participants.length >= group.maxSize) {
        showToast('Group sudah penuh!');
        return;
    }
    
    if (currentGroup) leaveCurrentGroup();
    
    group.participants.push({ name: userName, isHost: false, muted: false, isSpeaking: false });
    allGroups[currentMateri] = groups;
    saveGroups();
    
    currentGroup = group;
    renderGroupsList();
    renderParticipants();
    startSpeakingSim();
    
    showToast(`✅ Bergabung ke ${group.name}`);
    addSystemMessage(`🎙️ ${userName} bergabung ke "${group.name}"`);
}

function leaveCurrentGroup() {
    if (!currentGroup) return;
    
    let groups = allGroups[currentMateri] || [];
    const idx = groups.findIndex(g => g.id === currentGroup.id);
    
    if (idx !== -1) {
        const group = groups[idx];
        const newParticipants = group.participants.filter(p => p.name !== userName);
        
        if (newParticipants.length === 0) {
            groups.splice(idx, 1);
        } else {
            if (group.participants.find(p => p.name === userName)?.isHost && newParticipants.length > 0) {
                newParticipants[0].isHost = true;
            }
            group.participants = newParticipants;
            groups[idx] = group;
        }
        
        if (groups.length === 0) delete allGroups[currentMateri];
        else allGroups[currentMateri] = groups;
        saveGroups();
    }
    
    if (speakInterval) clearInterval(speakInterval);
    currentGroup = null;
    renderGroupsList();
    renderParticipants();
    addSystemMessage(`👋 ${userName} meninggalkan group call`);
}

function renderGroupsList() {
    const container = document.getElementById('activeGroupsList');
    
    if (!currentMateri) {
        container.innerHTML = '<div class="empty-groups">Pilih materi terlebih dahulu</div>';
        return;
    }
    
    const groups = allGroups[currentMateri] || [];
    
    if (groups.length === 0) {
        container.innerHTML = '<div class="empty-groups">Belum ada group call. Buat baru!</div>';
        return;
    }
    
    let html = '';
    groups.forEach(g => {
        const isInGroup = currentGroup && currentGroup.id === g.id;
        html += `
            <div class="group-item">
                <div>
                    <span class="group-badge ${g.type}">${g.type === 'sml' ? 'SML' : 'BDL'}</span>
                    <span style="margin-left: 8px;">${g.name}</span>
                    <span style="font-size: 0.7rem;">(${g.participants.length}/${g.maxSize === 5 ? '5' : '∞'})</span>
                </div>
                ${!isInGroup ? 
                    `<button class="btn-join" onclick="joinGroup('${g.id}')">Gabung</button>` :
                    `<span style="color:#22c55e; font-size:0.7rem;"><i class="fas fa-circle"></i> Aktif</span>`
                }
            </div>
        `;
    });
    container.innerHTML = html;
}

// ==================== MATERI ====================
function renderMateriChips() {
    const container = document.getElementById('materiChips');
    if (!container) {
        console.log('Container materiChips tidak ditemukan!');
        return;
    }
    
    container.innerHTML = '';
    
    materiList.forEach(m => {
        const chip = document.createElement('div');
        chip.className = 'materi-chip';
        chip.textContent = m;
        chip.onclick = () => {
            // Hapus active dari semua chip
            document.querySelectorAll('.materi-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentMateri = m;
            document.getElementById('currentTopicDisplay').textContent = m;
            // Reset group saat ganti materi
            if (currentGroup) leaveCurrentGroup();
            renderGroupsList();
            addSystemMessage(`📚 Materi dipilih: "${m}"`);
        };
        container.appendChild(chip);
    });
    
    // Pilih materi pertama sebagai default
    if (materiList.length > 0) {
        const firstChip = document.querySelector('.materi-chip');
        if (firstChip) {
            firstChip.classList.add('active');
            currentMateri = materiList[0];
            document.getElementById('currentTopicDisplay').textContent = currentMateri;
            renderGroupsList();
        }
    }
    
    console.log(`✅ ${materiList.length} materi berhasil dimuat`);
}

function searchMateri(keyword) {
    const chips = document.querySelectorAll('.materi-chip');
    const val = keyword.toLowerCase();
    let visibleCount = 0;
    
    chips.forEach(chip => {
        if (chip.textContent.toLowerCase().includes(val)) {
            chip.style.display = '';
            visibleCount++;
        } else {
            chip.style.display = 'none';
        }
    });
    
    // Tampilkan pesan jika tidak ada hasil
    const container = document.getElementById('materiChips');
    const noResult = document.getElementById('noResultMessage');
    if (visibleCount === 0 && val !== '') {
        if (!document.getElementById('noResultMsg')) {
            const msg = document.createElement('div');
            msg.id = 'noResultMsg';
            msg.className = 'no-result-chip';
            msg.textContent = '🔍 Materi tidak ditemukan';
            msg.style.textAlign = 'center';
            msg.style.padding = '20px';
            msg.style.color = 'var(--text-dim)';
            container.appendChild(msg);
        }
    } else {
        const existingMsg = document.getElementById('noResultMsg');
        if (existingMsg) existingMsg.remove();
    }
}

// ==================== CHAT ====================
function addMessage(user, text, isOwn = false, isSystem = false) {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    const div = document.createElement('div');
    div.className = `message ${isOwn ? 'own' : ''} ${isSystem ? 'system' : ''}`;
    div.innerHTML = `<div class="msg-user">${user}</div><div class="msg-text">${text}</div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function addSystemMessage(text) {
    addMessage('💬 Sistem', text, false, true);
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if (msg) {
        addMessage(userName, msg, true);
        input.value = '';
        setTimeout(() => {
            const replies = ["Menarik! Lanjutkan 👍", "Setuju!", "Ada referensi tambahan?", "Jelaskan lebih detail dong!"];
            addMessage('👤 Peserta', replies[Math.floor(Math.random() * replies.length)]);
        }, 1000);
    }
}

// ==================== CART ====================
function loadCart() {
    const saved = localStorage.getItem('obscura_cart');
    if (saved) { cart = JSON.parse(saved); updateCartUI(); }
}

function saveCart() { localStorage.setItem('obscura_cart', JSON.stringify(cart)); }

function addToCart(name, price) {
    const existing = cart.find(i => i.name === name);
    if (existing) existing.quantity++;
    else cart.push({ id: Date.now(), name, price, quantity: 1 });
    saveCart();
    updateCartUI();
    showToast(`✓ ${name} ditambahkan ke keranjang`);
}

function updateCartUI() {
    const itemsDiv = document.getElementById('cartItems');
    const countSpan = document.getElementById('cartCount');
    const totalSpan = document.getElementById('cartTotal');
    if (!itemsDiv) return;
    
    if (cart.length === 0) {
        itemsDiv.innerHTML = 'Keranjang kosong';
        if (countSpan) countSpan.textContent = '(0)';
        if (totalSpan) totalSpan.textContent = 'Rp 0';
        return;
    }
    
    let total = 0;
    let html = '';
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        html += `<div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--border);">
            ${item.name} x${item.quantity} = Rp ${itemTotal.toLocaleString('id-ID')}
            <button onclick="removeFromCart(${item.id})" style="background:none; border:none; color:#ef4444; cursor:pointer;">✕</button>
        </div>`;
    });
    itemsDiv.innerHTML = html;
    if (countSpan) countSpan.textContent = `(${cart.reduce((s,i)=>s+i.quantity,0)})`;
    if (totalSpan) totalSpan.textContent = `Rp ${total.toLocaleString('id-ID')}`;
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
    updateCartUI();
    showToast('Item dihapus dari keranjang');
}

function toggleCart() {
    const body = document.getElementById('cartBody');
    const icon = document.getElementById('cartIcon');
    if (body) {
        body.classList.toggle('hide');
        if (icon) icon.style.transform = body.classList.contains('hide') ? 'rotate(180deg)' : 'rotate(0deg)';
    }
}

function showToast(msg) {
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

// ==================== MODAL ====================
function openNameModal() {
    document.getElementById('nameModal').classList.add('active');
    document.getElementById('newUserName').value = userName;
}

function saveName() {
    const newName = document.getElementById('newUserName').value.trim();
    if (newName) {
        userName = newName;
        localStorage.setItem('obscura_name', userName);
        document.getElementById('displayUserName').textContent = userName;
        document.getElementById('nameModal').classList.remove('active');
        showToast(`✅ Nama berubah jadi ${userName}`);
        if (currentGroup) {
            const p = currentGroup.participants.find(p => p.name !== userName);
            if (p) p.name = userName;
            saveGroups();
            renderParticipants();
        }
    }
}

function openCheckoutModal() {
    if (cart.length === 0) { showToast('Keranjang kosong!'); return; }
    const summary = document.getElementById('checkoutSummary');
    const total = cart.reduce((s,i) => s + (i.price * i.quantity), 0);
    summary.innerHTML = `<div style="margin-bottom:16px;"><strong>Total: Rp ${total.toLocaleString('id-ID')}</strong><br>${cart.map(i => `${i.name} x${i.quantity}`).join(', ')}</div>`;
    document.getElementById('checkoutModal').classList.add('active');
}

function closeModals() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
}

// ==================== JITSI MEET ====================
let jitsiApi = null;

function startJitsiCall() {
    const roomName = document.getElementById('jitsiRoomName').value.trim() || `obscura-${Date.now()}`;
    document.getElementById('jitsiRoomName').value = roomName;
    
    const section = document.getElementById('jitsiSection');
    const wrapper = document.getElementById('jitsiFrameWrapper');
    section.style.display = 'block';
    
    if (jitsiApi) { jitsiApi.dispose(); wrapper.innerHTML = ''; }
    
    const domain = 'meet.jit.si';
    if (!document.querySelector('script[src*="external_api.js"]')) {
        const script = document.createElement('script');
        script.src = `https://${domain}/external_api.js`;
        script.onload = () => {
            jitsiApi = new JitsiMeetExternalAPI(domain, {
                roomName: roomName, parentNode: wrapper, width: '100%', height: 400,
                configOverwrite: { startWithAudioMuted: false, startWithVideoMuted: false, prejoinPageEnabled: false }
            });
        };
        document.head.appendChild(script);
    } else {
        jitsiApi = new JitsiMeetExternalAPI(domain, {
            roomName: roomName, parentNode: wrapper, width: '100%', height: 400,
            configOverwrite: { startWithAudioMuted: false, startWithVideoMuted: false, prejoinPageEnabled: false }
        });
    }
    addSystemMessage(`🎥 Video call dimulai! Room: ${roomName}`);
}

function closeJitsiCall() {
    if (jitsiApi) { jitsiApi.dispose(); jitsiApi = null; }
    document.getElementById('jitsiSection').style.display = 'none';
    document.getElementById('jitsiFrameWrapper').innerHTML = '';
    addSystemMessage('📞 Video call ditutup');
}

// ==================== THEME & ADMIN ====================
function initTheme() {
    const saved = localStorage.getItem('obscura_theme') || 'dark';
    document.body.setAttribute('data-theme', saved);
    const btn = document.getElementById('themeToggle');
    if (btn) btn.innerHTML = saved === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
    const current = document.body.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', next);
    localStorage.setItem('obscura_theme', next);
    const btn = document.getElementById('themeToggle');
    if (btn) btn.innerHTML = next === 'dark' ? '☀️' : '🌙';
}

function enableAdminMode() {
    isAdmin = true;
    localStorage.setItem('obscura_admin', 'true');
    document.getElementById('adminNote').style.display = 'block';
    document.getElementById('createBDLBtn').disabled = false;
    showToast('✅ Mode Admin aktif! Sekarang bisa buat BDL');
}

// ==================== PAGE NAVIGATION ====================
const pages = {
    home: document.getElementById('homePage'),
    discussion: document.getElementById('discussionPage'),
    products: document.getElementById('productsPage'),
    contact: document.getElementById('contactPage')
};

function showPage(pageId) {
    Object.keys(pages).forEach(id => pages[id]?.classList.remove('active-page'));
    pages[pageId]?.classList.add('active-page');
    document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.dataset.page === pageId) link.classList.add('active');
        else link.classList.remove('active');
    });
}

// ==================== ONLINE COUNTER ====================
let onlineUsers = 12;
setInterval(() => {
    if (Math.random() > 0.7) {
        onlineUsers += Math.random() > 0.5 ? 1 : -1;
        onlineUsers = Math.max(5, Math.min(25, onlineUsers));
        const span = document.getElementById('onlineCount');
        if (span) span.textContent = onlineUsers;
    }
}, 15000);

// ==================== EVENT LISTENERS ====================
document.getElementById('createSMLBtn')?.addEventListener('click', () => createGroup('sml'));
document.getElementById('createBDLBtn')?.addEventListener('click', () => createGroup('bdl'));
document.getElementById('leaveCallBtn')?.addEventListener('click', leaveCurrentGroup);
document.getElementById('sendMsgBtn')?.addEventListener('click', sendMessage);
document.getElementById('chatInput')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });
document.getElementById('searchMateri')?.addEventListener('input', (e) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => searchMateri(e.target.value), 300);
});
document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
document.getElementById('editUserNameBtn')?.addEventListener('click', openNameModal);
document.getElementById('saveNameBtn')?.addEventListener('click', saveName);
document.getElementById('checkoutBtn')?.addEventListener('click', openCheckoutModal);
document.getElementById('startJitsiBtn')?.addEventListener('click', startJitsiCall);
document.getElementById('closeJitsiBtn')?.addEventListener('click', closeJitsiCall);

document.querySelectorAll('.close-modal').forEach(close => close.addEventListener('click', closeModals));
window.addEventListener('click', (e) => { if (e.target.classList.contains('modal')) closeModals(); });

document.getElementById('confirmOrderBtn')?.addEventListener('click', () => {
    const name = document.getElementById('custName').value;
    const phone = document.getElementById('custPhone').value;
    const total = cart.reduce((s,i) => s + (i.price * i.quantity), 0);
    const items = cart.map(i => `${i.name} x${i.quantity}`).join(', ');
    const msg = `Halo OBSCURA! Saya ${name} (${phone}) ingin memesan:\n${items}\nTotal: Rp ${total.toLocaleString('id-ID')}`;
    window.open(`https://wa.me/6281122334455?text=${encodeURIComponent(msg)}`, '_blank');
    cart = [];
    saveCart();
    updateCartUI();
    closeModals();
    showToast('✅ Pesanan dikirim! Admin akan menghubungi Anda.');
});

document.querySelectorAll('.btn-buy').forEach(btn => {
    btn.addEventListener('click', () => addToCart(btn.dataset.name, parseInt(btn.dataset.price)));
});

document.querySelectorAll('.nav-links a[data-page]').forEach(link => {
    link.addEventListener('click', (e) => { e.preventDefault(); showPage(link.dataset.page); });
});

// Admin mode: klik logo 5x
let clickCount = 0, clickTimer = null;
document.getElementById('channelLogo')?.addEventListener('click', () => {
    clickCount++;
    if (clickTimer) clearTimeout(clickTimer);
    clickTimer = setTimeout(() => clickCount = 0, 1000);
    if (clickCount >= 5) { enableAdminMode(); clickCount = 0; }
});

// Cek admin status saat load
if (localStorage.getItem('obscura_admin') === 'true') {
    isAdmin = true;
    document.getElementById('adminNote').style.display = 'block';
    document.getElementById('createBDLBtn').disabled = false;
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing...');
    initTheme();
    renderMateriChips();
    loadCart();
    loadGroups();
    renderGroupsList();
    document.getElementById('displayUserName').textContent = userName;
    addSystemMessage('👋 Selamat datang! Pilih materi, lalu buat atau gabung group call.');
});