window.onload = function() {
    generateRings();
    resizePreview();
    
    // 日付初期値
    const today = new Date();
    const dateStr = `${today.getFullYear()} / ${today.getMonth() + 1} / ${today.getDate()}`;
    const dateInput = document.querySelector('.date-input input');
    if(dateInput) dateInput.value = dateStr;
    updateText('date', dateStr);

    updateText('rank1-title', 'MY BEST');
    updateText('rank2-title', 'MY BEST');
    updateText('rank3-title', 'MY BEST');
};

let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resizePreview, 200);
});

function resizePreview() {
    const area = document.getElementById('capture-area');
    const stage = document.querySelector('.preview-stage');
    if (!area || !stage) return;
    const scale = stage.offsetWidth / 1400;
    area.style.transform = `scale(${scale})`;
    stage.style.height = (1000 * scale) + "px";
}

function generateRings() {
    const container = document.querySelector('.binder-rings');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 11; i++) {
        const ring = document.createElement('div');
        ring.className = 'ring';
        container.appendChild(ring);
    }
}

function updateText(id, val) {
    const el = document.getElementById('prev-' + id);
    if (el) {
        el.innerText = val;
        // 文字数調整の対象クラスなら実行
        if (el.classList.contains('auto-fit')) {
            adjustFontSize(el);
        }
    }
}

// フォントサイズ自動調整関数
function adjustFontSize(el) {
    let size = 32; // 最大サイズ
    if (el.classList.contains('name-wide')) size = 32;
    else if (el.classList.contains('fill-line')) size = 22;
    else if (el.classList.contains('fb-val')) size = 20;
    else size = 18;

    el.style.fontSize = size + 'px'; // 一旦リセット
    
    // はみ出している間、サイズを小さくする
    while (el.scrollWidth > el.offsetWidth && size > 8) {
        size--;
        el.style.fontSize = size + 'px';
    }
}

function updateIcon(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = e => {
            const img = document.getElementById('preview-icon');
            const placeholder = document.getElementById('icon-placeholder');
            if (img) {
                img.src = e.target.result;
                img.style.display = 'block';
            }
            if (placeholder) {
                placeholder.style.display = 'none';
            }
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function selectChoice(groupId, index, btn) {
    const btnGroup = btn.parentElement;
    const allBtns = btnGroup.querySelectorAll('.c-btn');
    allBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const prevRow = document.getElementById(groupId + '-prev');
    if (prevRow) {
        const opts = prevRow.querySelectorAll('.opt');
        opts.forEach(o => o.classList.remove('circled'));
        if (opts[index]) {
            opts[index].classList.add('circled');
        }
    }
}

let generatedBlobUrl = null;

async function generateImage() {
    const loading = document.getElementById('loading');
    const loadingText = loading.querySelector('p');
    if(loadingText) loadingText.innerText = "カキカキ中...";
    loading.style.display = 'flex';
    window.scrollTo(0, 0);

    const sandbox = document.createElement('div');
    sandbox.style.position = 'fixed';
    sandbox.style.top = '0';
    sandbox.style.left = '-9999px';
    sandbox.style.width = '1400px';
    sandbox.style.height = '1000px';
    sandbox.style.overflow = 'hidden';
    sandbox.style.zIndex = '-9999';
    document.body.appendChild(sandbox);

    const original = document.getElementById('prof-book');
    const clone = original.cloneNode(true);
    sandbox.appendChild(clone);

    try {
        await new Promise(r => setTimeout(r, 1500));

        const canvas = await html2canvas(clone, {
            scale: 1.5,
            useCORS: true,
            backgroundColor: null,
            logging: false
        });

        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 0.9));
        generatedBlobUrl = URL.createObjectURL(blob);

        const resultImg = document.getElementById('generated-image');
        resultImg.src = generatedBlobUrl;
        resultImg.style.display = 'block';

        loading.style.display = 'none';
        document.getElementById('step1').classList.remove('active');
        document.getElementById('step2').classList.add('active');
        window.scrollTo(0, 0);
        document.body.removeChild(sandbox);

    } catch (err) {
        console.error(err);
        alert('画像の作成に失敗しました');
        loading.style.display = 'none';
        if (document.body.contains(sandbox)) {
            document.body.removeChild(sandbox);
        }
    }
}

function saveImage() {
    if (!generatedBlobUrl) {
        alert('画像がまだできてないよ！');
        return;
    }
    const link = document.createElement('a');
    link.href = generatedBlobUrl;
    link.download = `Heisei_Prof_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function backToEdit() {
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step1').classList.add('active');
    setTimeout(resizePreview, 100);
}