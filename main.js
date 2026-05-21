const ALL_SIZES = [1024, 512, 256, 192, 180, 167, 152, 144, 128, 120, 114, 100, 96, 87, 80, 76, 72, 60, 58, 57, 50, 48, 40, 29, 20];

const uploadArea      = document.getElementById('uploadArea');
const fileInput       = document.getElementById('fileInput');
const uploadPlaceholder = document.getElementById('uploadPlaceholder');
const uploadPreview   = document.getElementById('uploadPreview');
const previewImg           = document.getElementById('previewImg');
const previewThumbPlaceholder = document.getElementById('previewThumbPlaceholder');
const previewInfo     = document.getElementById('previewInfo');
const generateBtn     = document.getElementById('generateBtn');
const progressWrap    = document.getElementById('progressWrap');
const progressFill    = document.getElementById('progressFill');
const progressLabel   = document.getElementById('progressLabel');
const errorMsg        = document.getElementById('errorMsg');

let loadedImage = null;

// --- Upload interaction ---

uploadArea.addEventListener('click', () => fileInput.click());

uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', () => {
  uploadArea.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});

fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) handleFile(fileInput.files[0]);
});

function handleFile(file) {
  hideError();

  if (!file.type.startsWith('image/')) {
    showError('PNG または JPG 画像を選択してください。');
    return;
  }

  const url = URL.createObjectURL(file);
  const img = new Image();

  img.onload = () => {
    loadedImage = img;

    previewImg.src = url;
    previewImg.style.display = 'block';
    previewThumbPlaceholder.style.display = 'none';
    previewInfo.innerHTML =
      `<p class="preview-filename">${file.name}</p>` +
      `<p class="preview-meta">` +
        `<span class="meta-item">` +
          `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>` +
          `${img.naturalWidth} × ${img.naturalHeight} px` +
        `</span>` +
        `<span class="meta-item">` +
          `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>` +
          `${(file.size / 1024).toFixed(0)} KB` +
        `</span>` +
      `</p>`;

    uploadPlaceholder.hidden = true;
    uploadPreview.hidden = false;
    generateBtn.disabled = false;
  };

  img.onerror = () => showError('画像の読み込みに失敗しました。');
  img.src = url;
}

// --- Generate ---

generateBtn.addEventListener('click', async () => {
  hideError();

  if (!loadedImage) {
    showError('画像をアップロードしてください。');
    return;
  }

  generateBtn.disabled = true;
  progressWrap.hidden = false;
  setProgress(0, '処理中...');

  try {
    const zip = new JSZip();
    const total = ALL_SIZES.length;

    for (let i = 0; i < ALL_SIZES.length; i++) {
      const size = ALL_SIZES[i];
      setProgress(Math.round((i / total) * 100), `${size}px を生成中...`);
      const blob = await resizeToBlob(loadedImage, size);
      zip.file(`icon_${size}.png`, blob);
    }

    setProgress(95, 'ZIP を生成中...');
    const zipBlob = await zip.generateAsync({ type: 'blob' });

    setProgress(100, '完了！');
    saveAs(zipBlob, 'app-icons.zip');
  } catch (err) {
    showError('生成中にエラーが発生しました: ' + err.message);
  } finally {
    generateBtn.disabled = false;
    setTimeout(() => {
      progressWrap.hidden = true;
      setProgress(0, '');
    }, 2000);
  }
});


function resizeToBlob(img, size) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, size, size);
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Blob 変換失敗'));
    }, 'image/png');
  });
}

// --- Helpers ---

function setProgress(percent, label) {
  progressFill.style.width = percent + '%';
  progressLabel.textContent = label;
}

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.hidden = false;
}

function hideError() {
  errorMsg.hidden = true;
  errorMsg.textContent = '';
}
