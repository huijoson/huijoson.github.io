const heroImage = new URL('./images/IMG_7754.jpg', import.meta.url).href;

const app = document.querySelector('#app');

const state = {
  images: [
    {
      id: crypto.randomUUID(),
      name: '倫敦回憶',
      src: heroImage,
      uploaded: false,
    },
  ],
  activeIndex: 0,
  wheelLocked: false,
  modalImageId: null,
};

app.innerHTML = `
  <div class="cloud-shell">
    <section class="hero-panel">
      <div class="hero-copy">
        <p class="eyebrow">Cinnamoroll inspired photo room</p>
        <h1>大耳狗雲朵相簿</h1>
        <p class="hero-text">
          上傳你喜歡的照片，像翻閱雲朵故事書一樣，一張一張往下看。
          相簿預覽會變成可愛的 8-bit 風格，點進去就能看到真正的照片。
        </p>
        <label class="upload-card" for="photo-upload">
          <span class="upload-badge">☁️ 上傳圖片</span>
          <span class="upload-help">支援多張圖片，會直接加入下方相簿。</span>
          <input id="photo-upload" type="file" accept="image/*" multiple />
        </label>
        <div class="hero-notes">
          <span>⬇️ 用滑鼠滾輪一張一張瀏覽</span>
          <span>🟦 預覽會自動轉為 8-bit</span>
          <span>📸 點圖片看原始相片</span>
        </div>
      </div>
      <div class="hero-preview">
        <div class="mascot-card">
          <span class="mascot-tag">初始封面</span>
          <img src="${heroImage}" alt="倫敦回憶封面照片" class="hero-image" />
        </div>
      </div>
    </section>

    <section class="album-section" aria-labelledby="album-title">
      <div class="section-head">
        <div>
          <p class="eyebrow">Album</p>
          <h2 id="album-title">滾輪一張一張相簿</h2>
        </div>
        <div class="album-actions">
          <button type="button" class="nav-button" data-direction="-1" aria-label="上一張">↑</button>
          <button type="button" class="nav-button" data-direction="1" aria-label="下一張">↓</button>
        </div>
      </div>
      <div class="album-status" aria-live="polite"></div>
      <div class="album-viewport" tabindex="0" aria-label="可用滾輪逐張瀏覽的相簿"></div>
    </section>
  </div>

  <dialog class="photo-modal">
    <form method="dialog" class="modal-backdrop">
      <button class="close-button" aria-label="關閉照片">✕</button>
    </form>
    <div class="modal-content">
      <div class="modal-copy">
        <p class="eyebrow">Photo</p>
        <h3 class="modal-title"></h3>
        <p class="modal-text">這裡顯示實際相片，保留原本的色彩與細節。</p>
      </div>
      <img class="modal-image" alt="" />
    </div>
  </dialog>
`;

const fileInput = document.querySelector('#photo-upload');
const albumViewport = document.querySelector('.album-viewport');
const albumStatus = document.querySelector('.album-status');
const modal = document.querySelector('.photo-modal');
const modalTitle = document.querySelector('.modal-title');
const modalImage = document.querySelector('.modal-image');
const navButtons = document.querySelectorAll('.nav-button');

function updateStatus() {
  const total = state.images.length;
  const current = total === 0 ? 0 : state.activeIndex + 1;
  albumStatus.textContent = `第 ${current} / ${total} 張`;
}

function pixelateImage(image, canvas) {
  const width = 320;
  const ratio = image.naturalHeight / image.naturalWidth || 1;
  const height = Math.max(220, Math.round(width * ratio));
  const pixelSize = 18;
  const scaledWidth = Math.max(16, Math.round(width / pixelSize));
  const scaledHeight = Math.max(16, Math.round(height / pixelSize));

  const offscreen = document.createElement('canvas');
  offscreen.width = scaledWidth;
  offscreen.height = scaledHeight;
  const offscreenCtx = offscreen.getContext('2d');
  offscreenCtx.imageSmoothingEnabled = false;
  offscreenCtx.drawImage(image, 0, 0, scaledWidth, scaledHeight);

  canvas.width = width;
  canvas.height = height;
  canvas.style.aspectRatio = `${width} / ${height}`;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(offscreen, 0, 0, scaledWidth, scaledHeight, 0, 0, width, height);
}

function enhancePreview(canvas) {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
  ctx.lineWidth = 6;
  ctx.strokeRect(12, 12, width - 24, height - 24);
  ctx.restore();
}

function renderAlbum() {
  albumViewport.innerHTML = state.images
    .map(
      (image, index) => `
        <article class="album-slide" data-index="${index}">
          <button type="button" class="preview-card" data-image-id="${image.id}">
            <div class="slide-copy">
              <span class="slide-count">Photo ${String(index + 1).padStart(2, '0')}</span>
              <h3>${image.name}</h3>
              <p>8-bit 預覽模式，點一下查看真實相片。</p>
            </div>
            <div class="preview-frame">
              <canvas class="pixel-canvas" data-src="${image.src}" aria-hidden="true"></canvas>
            </div>
          </button>
        </article>
      `,
    )
    .join('');

  albumViewport.querySelectorAll('.pixel-canvas').forEach((canvas) => {
    const previewImage = new Image();
    previewImage.src = canvas.dataset.src;
    previewImage.alt = '';
    previewImage.addEventListener('load', () => {
      pixelateImage(previewImage, canvas);
      enhancePreview(canvas);
    });
  });

  updateStatus();
}

function scrollToSlide(nextIndex) {
  const clampedIndex = Math.max(0, Math.min(nextIndex, state.images.length - 1));
  const slides = albumViewport.querySelectorAll('.album-slide');
  const target = slides[clampedIndex];

  if (!target) {
    return;
  }

  state.activeIndex = clampedIndex;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  updateStatus();
}

function lockWheelNavigation() {
  state.wheelLocked = true;
  window.setTimeout(() => {
    state.wheelLocked = false;
  }, 650);
}

function openModal(imageId) {
  const image = state.images.find((item) => item.id === imageId);

  if (!image) {
    return;
  }

  state.modalImageId = imageId;
  modalTitle.textContent = image.name;
  modalImage.src = image.src;
  modalImage.alt = image.name;

  if (typeof modal.showModal === 'function') {
    modal.showModal();
  } else {
    modal.setAttribute('open', 'open');
  }
}

fileInput.addEventListener('change', (event) => {
  const files = Array.from(event.target.files || []);

  if (files.length === 0) {
    return;
  }

  const uploadedImages = files
    .filter((file) => file.type.startsWith('image/'))
    .map((file) => ({
      id: crypto.randomUUID(),
      name: file.name.replace(/\.[^.]+$/, ''),
      src: URL.createObjectURL(file),
      uploaded: true,
    }));

  state.images = [...state.images, ...uploadedImages];
  renderAlbum();
  scrollToSlide(state.images.length - uploadedImages.length);
  fileInput.value = '';
});

albumViewport.addEventListener(
  'wheel',
  (event) => {
    event.preventDefault();

    if (state.wheelLocked || state.images.length < 2) {
      return;
    }

    const direction = event.deltaY > 0 ? 1 : -1;
    lockWheelNavigation();
    scrollToSlide(state.activeIndex + direction);
  },
  { passive: false },
);

albumViewport.addEventListener('click', (event) => {
  const trigger = event.target.closest('.preview-card');

  if (!trigger) {
    return;
  }

  openModal(trigger.dataset.imageId);
});

albumViewport.addEventListener('scroll', () => {
  const slides = Array.from(albumViewport.querySelectorAll('.album-slide'));
  const viewportTop = albumViewport.scrollTop;
  const viewportHeight = albumViewport.clientHeight;

  let nextIndex = state.activeIndex;
  let smallestDistance = Number.POSITIVE_INFINITY;

  slides.forEach((slide, index) => {
    const distance = Math.abs(slide.offsetTop - viewportTop - viewportHeight * 0.1);
    if (distance < smallestDistance) {
      smallestDistance = distance;
      nextIndex = index;
    }
  });

  if (nextIndex !== state.activeIndex) {
    state.activeIndex = nextIndex;
    updateStatus();
  }
});

navButtons.forEach((button) => {
  button.addEventListener('click', () => {
    scrollToSlide(state.activeIndex + Number(button.dataset.direction));
  });
});

modal.addEventListener('click', (event) => {
  if (event.target === modal) {
    modal.close();
  }
});

window.addEventListener('beforeunload', () => {
  state.images.forEach((image) => {
    if (image.uploaded) {
      URL.revokeObjectURL(image.src);
    }
  });
});

renderAlbum();
