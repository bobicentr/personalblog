
const SUPABASE_URL = 'https://vebqimlusmxpdlrmwrlz.supabase.co/';
const SUPABASE_KEY = 'sb_publishable_IGZOx-plKDsDczkYjZbv4Q_YEbXuYfq';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function loadSinglePost() {
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
        .eq('id', postId) 
        .single(); 

    // 3. Отображаем
    if (error) {
        document.getElementById('detail-title').innerText = 'Ошибка загрузки';
        console.error(error);
    } else {
        document.getElementById('detail-title').innerText = data.title;
        document.getElementById('detail-date').innerText = new Date(data.created_at).toLocaleDateString();
        document.getElementById('detail-body').innerText = data.body;
    }
}

loadSinglePost();
