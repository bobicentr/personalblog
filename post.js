
const SUPABASE_URL = 'https://vebqimlusmxpdlrmwrlz.supabase.co/';
const SUPABASE_KEY = 'sb_publishable_IGZOx-plKDsDczkYjZbv4Q_YEbXuYfq';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function loadSinglePost() {
    // 1. Получаем ID из адресной строки (post.html?id=123)
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('id');

    if (!postId) {
        document.getElementById('detail-title').innerText = 'Пост не найден (нет ID)';
        return;
    }

    // 2. Запрашиваем пост из базы
    const { data, error } = await sb
        .from('posts')
        .select('*')
        .eq('id', postId) // Фильтр: WHERE id = postId
        .single(); // Нам нужен только один объект, а не массив

    // 3. Отображаем
    if (error) {
        document.getElementById('detail-title').innerText = 'Ошибка загрузки';
        console.error(error);
    } else {
        document.getElementById('detail-title').innerText = data.title;
        document.getElementById('detail-date').innerText = new Date(data.created_at).toLocaleDateString();
        // Для сохранения переносов строк используем white-space: pre-wrap в CSS
        // или заменяем \n на <br>
        document.getElementById('detail-body').innerText = data.body;
    }
}

loadSinglePost();