
const SUPABASE_URL = 'https://vebqimlusmxpdlrmwrlz.supabase.co/';
const SUPABASE_KEY = 'sb_publishable_IGZOx-plKDsDczkYjZbv4Q_YEbXuYfq';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Элементы DOM
const postsGrid = document.getElementById('posts-grid');
const loginForm = document.getElementById('login-form');
const createPostForm = document.getElementById('create-post-form');

// 1. ЗАГРУЗКА ПОСТОВ
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

// 2. ОТРИСОВКА (Рендер)
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
    
    // ВАЖНО: После перерисовки постов нужно проверить, админ мы или нет, 
    // чтобы показать кнопки удаления, если мы уже вошли.
    checkAdminVisibility(); 
}

// Защита от XSS (чтобы html теги в тексте не ломали сайт)
function escapeHtml(text) {
    if (!text) return "";
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// 3. АВТОРИЗАЦИЯ (Слушатель событий)
// Этот код срабатывает сам при загрузке страницы и при входе/выходе
sb.auth.onAuthStateChange((event, session) => {
    const adminElements = document.querySelectorAll('.admin-only');
    const loginBtn = document.getElementById('login-btn-toggle');
    
    if (session) {
        // Админ вошел
        adminElements.forEach(el => el.style.display = 'block');
        loginBtn.style.display = 'none';
        loginForm.classList.add('hidden'); // Спрятать форму входа
    } else {
        // Гость
        adminElements.forEach(el => el.style.display = 'none');
        loginBtn.style.display = 'block';
    }
});

// Логика кнопок входа/выхода
document.getElementById('login-btn-toggle').addEventListener('click', () => {
    loginForm.classList.toggle('hidden');
});

document.getElementById('logout-btn').addEventListener('click', async () => {
    await sb.auth.signOut();
});

// Обработка формы входа
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) alert('Ошибка входа: ' + error.message);
    else loginForm.reset();
});

// 4. СОЗДАНИЕ ПОСТА
createPostForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('new-post-title').value;
    const body = document.getElementById('new-post-body').value;

    // Проверка: авторизован ли?
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
        fetchPosts(); // Перерисовать список постов
        alert('Пост опубликован!');
    }
});

// Функция для проверки: если мы админ, показываем скрытые элементы
async function checkAdminVisibility() {
    const { data: { session } } = await sb.auth.getSession();
    const adminElements = document.querySelectorAll('.admin-only');
    
    if (session) {
        adminElements.forEach(el => el.style.display = 'inline-block'); // Или 'block'
    } else {
        adminElements.forEach(el => el.style.display = 'none');
    }
}

// Слушаем клики внутри сетки постов
postsGrid.addEventListener('click', async (e) => {
    // Проверяем, содержит ли элемент, на который нажали, класс 'btn-delete'
    if (e.target.classList.contains('btn-delete')) {
        const postId = e.target.getAttribute('data-id');
        
        const confirmDelete = confirm('Вы точно хотите удалить этот пост?');
        if (!confirmDelete) return;

        // Удаляем из Supabase
        const { error } = await sb
            .from('posts')
            .delete()
            .eq('id', postId);

        if (error) {
            alert('Ошибка удаления: ' + error.message);
        } else {
            // Удаляем карточку визуально без перезагрузки страницы
            // Находим ближайшего родителя (карточку) и удаляем его
            e.target.closest('.post-card').remove();
            alert('Пост удален!');
        }
    }
});
// Запуск при старте
fetchPosts();