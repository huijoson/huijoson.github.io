import './style.css'
import samplePhoto from './images/IMG_7754.jpg'

const DB_NAME = 'cinnamoroll-gallery'
const STORE_NAME = 'photos'
const PIXEL_SIZE = 48

const state = {
  photos: [],
  activePhotoId: null,
  scrollLocked: false,
  objectUrls: [],
}

const app = document.querySelector('#app')

app.innerHTML = `
  <div class="app-shell">
    <header class="topbar">
      <div class="brand-block">
        <p class="eyebrow">Cinnamoroll dreamy album</p>
        <h1>大耳狗雲朵相簿</h1>
        <p class="subtitle">滾輪往下，一張一張翻閱 8-bit 預覽；點開就看真正的照片。</p>
      </div>
      <label class="upload-card" for="photo-upload">
        <span class="upload-icon">☁️</span>
        <span class="upload-copy">
          <strong>上傳圖片</strong>
          <small>圖片會儲存在目前瀏覽器中</small>
        </span>
      </label>
      <input id="photo-upload" type="file" accept="image/*" multiple />
    </header>

    <div class="floating-hint">
      <span id="gallery-count">讀取相簿中…</span>
      <span>使用滾輪 / 方向鍵瀏覽</span>
    </div>

    <main class="gallery-track" aria-live="polite"></main>

    <div class="viewer hidden" id="viewer" role="dialog" aria-modal="true" aria-labelledby="viewer-title">
      <button class="viewer-close" id="viewer-close" type="button" aria-label="關閉原圖">✕</button>
      <div class="viewer-panel">
        <p class="viewer-label">Original photo</p>
        <h2 id="viewer-title"></h2>
        <img id="viewer-image" alt="" />
      </div>
    </div>
  </div>
`

const galleryTrack = document.querySelector('.gallery-track')
const uploadInput = document.querySelector('#photo-upload')
const galleryCount = document.querySelector('#gallery-count')
const viewer = document.querySelector('#viewer')
const viewerImage = document.querySelector('#viewer-image')
const viewerTitle = document.querySelector('#viewer-title')
const viewerClose = document.querySelector('#viewer-close')

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('資料存取失敗'))
  })
}

function openGalleryDatabase() {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, 1)

    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('無法開啟相簿資料庫'))
  })
}

async function getStoredPhotos() {
  try {
    const database = await openGalleryDatabase()
    const transaction = database.transaction(STORE_NAME, 'readonly')
    const records = await requestToPromise(transaction.objectStore(STORE_NAME).getAll())
    database.close()

    return records
      .sort((left, right) => left.createdAt - right.createdAt)
      .map((record) => {
        const fullSrc = URL.createObjectURL(record.file)
        state.objectUrls.push(fullSrc)

        return {
          id: record.id,
          title: record.title,
          note: record.note,
          previewSrc: record.previewSrc,
          fullSrc,
        }
      })
  } catch (error) {
    console.error(error)
    return []
  }
}

async function savePhotoRecord(record) {
  const database = await openGalleryDatabase()
  const transaction = database.transaction(STORE_NAME, 'readwrite')
  transaction.objectStore(STORE_NAME).put(record)
  await new Promise((resolve, reject) => {
    transaction.oncomplete = resolve
    transaction.onerror = () => reject(transaction.error ?? new Error('儲存照片失敗'))
    transaction.onabort = () => reject(transaction.error ?? new Error('儲存照片失敗'))
  })
  database.close()
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('圖片載入失敗'))
    image.src = src
  })
}

async function createPixelPreview(src) {
  const image = await loadImage(src)
  const canvas = document.createElement('canvas')
  canvas.width = PIXEL_SIZE
  canvas.height = PIXEL_SIZE
  const context = canvas.getContext('2d')

  if (!context) {
    return src
  }

  const shortestSide = Math.min(image.width, image.height)
  const sourceX = (image.width - shortestSide) / 2
  const sourceY = (image.height - shortestSide) / 2

  context.imageSmoothingEnabled = false
  context.drawImage(
    image,
    sourceX,
    sourceY,
    shortestSide,
    shortestSide,
    0,
    0,
    PIXEL_SIZE,
    PIXEL_SIZE,
  )

  return canvas.toDataURL('image/png')
}

function createPhotoMarkup(photo, index) {
  return `
    <section class="gallery-slide" data-index="${index}" aria-label="${photo.title}">
      <div class="photo-card">
        <div class="photo-meta">
          <p class="photo-order">No. ${String(index + 1).padStart(2, '0')}</p>
          <h2>${photo.title}</h2>
          <p>${photo.note}</p>
        </div>
        <button class="pixel-frame" type="button" data-photo-id="${photo.id}" aria-label="查看 ${photo.title} 原圖">
          <img src="${photo.previewSrc}" alt="${photo.title} 的 8-bit 預覽" loading="lazy" />
          <span>點我看原圖</span>
        </button>
      </div>
    </section>
  `
}

function getPhotoById(photoId) {
  return state.photos.find((photo) => photo.id === photoId)
}

function renderGallery() {
  galleryTrack.innerHTML = state.photos.map(createPhotoMarkup).join('')
  galleryCount.textContent = `目前有 ${state.photos.length} 張照片`

  galleryTrack.querySelectorAll('[data-photo-id]').forEach((button) => {
    button.addEventListener('click', () => {
      openViewer(button.dataset.photoId)
    })
  })
}

function openViewer(photoId) {
  const photo = getPhotoById(photoId)
  if (!photo) {
    return
  }

  state.activePhotoId = photoId
  viewerImage.src = photo.fullSrc
  viewerImage.alt = photo.title
  viewerTitle.textContent = photo.title
  viewer.classList.remove('hidden')
  document.body.classList.add('viewer-open')
}

function closeViewer() {
  state.activePhotoId = null
  viewer.classList.add('hidden')
  viewerImage.src = ''
  viewerImage.alt = ''
  document.body.classList.remove('viewer-open')
}

function getCurrentSlideIndex() {
  if (!state.photos.length) {
    return 0
  }

  return Math.round(galleryTrack.scrollTop / galleryTrack.clientHeight)
}

function scrollToSlide(nextIndex) {
  const clampedIndex = Math.max(0, Math.min(nextIndex, state.photos.length - 1))
  const target = galleryTrack.querySelector(`[data-index="${clampedIndex}"]`)

  if (!target) {
    return
  }

  target.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function handleWheelNavigation(event) {
  if (viewer.classList.contains('hidden') === false) {
    return
  }

  event.preventDefault()

  if (state.scrollLocked || state.photos.length < 2) {
    return
  }

  const direction = Math.sign(event.deltaY)
  if (!direction) {
    return
  }

  state.scrollLocked = true
  scrollToSlide(getCurrentSlideIndex() + direction)

  window.setTimeout(() => {
    state.scrollLocked = false
  }, 650)
}

async function convertFileToGalleryPhoto(file) {
  const fullSrc = URL.createObjectURL(file)
  state.objectUrls.push(fullSrc)
  const previewSrc = await createPixelPreview(fullSrc)
  const normalizedTitle = file.name
    .replace(/\.[^.]+$/, '')
    .trim()
    .replace(/^\.+|\.+$/g, '')

  const photo = {
    id: crypto.randomUUID(),
    title: normalizedTitle || '新的雲朵回憶',
    note: '來自你剛剛上傳的照片',
    previewSrc,
    fullSrc,
    file,
    createdAt: Date.now(),
  }

  await savePhotoRecord({
    id: photo.id,
    title: photo.title,
    note: photo.note,
    previewSrc: photo.previewSrc,
    file: photo.file,
    createdAt: photo.createdAt,
  })

  return photo
}

async function handlePhotoUpload(event) {
  const files = Array.from(event.target.files ?? []).filter((file) => file.type.startsWith('image/'))
  if (!files.length) {
    return
  }

  galleryCount.textContent = '正在把照片裝進雲朵裡…'

  try {
    const newPhotos = await Promise.all(files.map(convertFileToGalleryPhoto))
    state.photos = [...state.photos, ...newPhotos]
    renderGallery()
    scrollToSlide(state.photos.length - newPhotos.length)
  } catch (error) {
    galleryCount.textContent = '上傳失敗，請重新試一次'
    console.error(error)
  } finally {
    uploadInput.value = ''
  }
}

function handleKeyboardNavigation(event) {
  if (event.key === 'Escape') {
    closeViewer()
    return
  }

  if (viewer.classList.contains('hidden') === false) {
    return
  }

  if (event.key === 'ArrowDown') {
    scrollToSlide(getCurrentSlideIndex() + 1)
  }

  if (event.key === 'ArrowUp') {
    scrollToSlide(getCurrentSlideIndex() - 1)
  }
}

async function createSeedPhoto() {
  return {
    id: 'seed-photo',
    title: '雲朵出發前',
    note: '先用 8-bit 模樣預覽，打開後就是完整的真實照片。',
    previewSrc: await createPixelPreview(samplePhoto),
    fullSrc: samplePhoto,
  }
}

async function initializeGallery() {
  const [seedPhoto, storedPhotos] = await Promise.all([createSeedPhoto(), getStoredPhotos()])
  state.photos = [seedPhoto, ...storedPhotos]
  renderGallery()
}

uploadInput.addEventListener('change', handlePhotoUpload)
galleryTrack.addEventListener('wheel', handleWheelNavigation, { passive: false })
viewer.addEventListener('click', (event) => {
  if (event.target === viewer) {
    closeViewer()
  }
})
viewerClose.addEventListener('click', closeViewer)
window.addEventListener('keydown', handleKeyboardNavigation)
window.addEventListener('beforeunload', () => {
  state.objectUrls.forEach((url) => URL.revokeObjectURL(url))
})

initializeGallery().catch((error) => {
  galleryCount.textContent = '相簿讀取失敗，請重新整理頁面'
  console.error(error)
})
