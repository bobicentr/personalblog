
const SUPABASE_URL = 'https://vebqimlusmxpdlrmwrlz.supabase.co/';
const SUPABASE_KEY = 'sb_publishable_IGZOx-plKDsDczkYjZbv4Q_YEbXuYfq';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const postsGrid = document.getElementById('posts-grid');
const loginForm = document.getElementById('login-form');
const createPostForm = document.getElementById('create-post-form');

async function fetchPosts() {
    const { data, error } = await sb
        .from('posts')
        .select('*')

    if (error) {
        postsGrid.innerHTML = '<p>Ошибка загрузки</p>';
        console.error(error);
    } else {
        renderPosts(data);
    }
}

function renderPosts(posts) {
    if (!posts.length) {
        postsGrid.innerHTML = '<p>Постов пока нет.</p>';
        return;
    }

    postsGrid.innerHTML = posts.map(post => `
        <article class="post-card">
            <div>
                <h3 class="post-title">${escapeHtml(post.title)}</h3>
                <p class="post-excerpt">${escapeHtml(post.body)}</p>
            </div>
            
            <div class="post-actions">
                <a href="post.html?id=${post.id}" class="read-link">Читать →</a>
                
                <!-- КНОПКА УДАЛЕНИЯ (Скрыта для обычных людей) -->
                <button class="btn-delete admin-only" data-id="${post.id}">Удалить</button>
            </div> 
        </article>
    `).join('');
    checkAdminVisibility(); 
}

function escapeHtml(text) {
    if (!text) return "";
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
sb.auth.onAuthStateChange((event, session) => {
    const adminElements = document.querySelectorAll('.admin-only');
    const loginBtn = document.getElementById('login-btn-toggle');
    
    if (session) {
        adminElements.forEach(el => el.style.display = 'block');
        loginBtn.style.display = 'none';
        loginForm.classList.add('hidden'); 
    } else {
        adminElements.forEach(el => el.style.display = 'none');
        loginBtn.style.display = 'block';
    }
});

document.getElementById('login-btn-toggle').addEventListener('click', () => {
    loginForm.classList.toggle('hidden');
});

document.getElementById('logout-btn').addEventListener('click', async () => {
    await sb.auth.signOut();
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) alert('Ошибка входа: ' + error.message);
    else loginForm.reset();
});

createPostForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('new-post-title').value;
    const body = document.getElementById('new-post-body').value;
    const { data: { user } } = await sb.auth.getUser();
    if (!user) {
        alert('Вы не авторизованы!');
        return;
    }

    const { error } = await sb
        .from('posts')
        .insert({ title, body });

    if (error) {
        alert('Ошибка создания: ' + error.message);
    } else {
        createPostForm.reset();
        fetchPosts();
        alert('Пост опубликован!');
    }
});

async function checkAdminVisibility() {
    const { data: { session } } = await sb.auth.getSession();
    const adminElements = document.querySelectorAll('.admin-only');
    
    if (session) {
        adminElements.forEach(el => el.style.display = 'inline-block'); 
    } else {
        adminElements.forEach(el => el.style.display = 'none');
    }
}

postsGrid.addEventListener('click', async (e) => {
    if (e.target.classList.contains('btn-delete')) {
        const postId = e.target.getAttribute('data-id');
        
        const confirmDelete = confirm('Вы точно хотите удалить этот пост?');
        if (!confirmDelete) return;

        const { error } = await sb
            .from('posts')
            .delete()
            .eq('id', postId);

        if (error) {
            alert('Ошибка удаления: ' + error.message);
        } else {

            e.target.closest('.post-card').remove();
            alert('Пост удален!');
        }
    }
});

fetchPosts();
