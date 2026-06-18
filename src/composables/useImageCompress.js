// 브라우저(canvas)에서 이미지를 리사이즈·압축해 dataURL 로 변환한다.
// Firestore 문서(1MB) 한도 안에 들어가도록 가로 길이/품질을 조절한다.
const MAX_DIM = 1280 // 가로/세로 최대 픽셀
const MAX_BYTES = 920 * 1024 // dataURL 목표 상한 (문서 1MB 한도 여유)

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('이미지를 불러올 수 없습니다(지원하지 않는 형식일 수 있어요).'))
    }
    img.src = url
  })
}

// dataURL 의 대략적 바이트 수 (base64 길이 기반)
function dataUrlBytes(dataUrl) {
  const i = dataUrl.indexOf(',')
  return Math.ceil(((dataUrl.length - i - 1) * 3) / 4)
}

// 아이폰 HEIC/HEIF 판별 (일부 브라우저는 canvas 로 디코딩 못 함 → JPEG 로 선변환)
function isHeic(file) {
  const t = (file.type || '').toLowerCase()
  const n = (file.name || '').toLowerCase()
  return t.includes('heic') || t.includes('heif') || /\.(heic|heif)$/.test(n)
}

// HEIC → JPEG Blob (heic2any 동적 import: 평소 번들에 영향 없음)
async function heicToJpeg(file) {
  const heic2any = (await import('heic2any')).default
  const out = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 })
  const blob = Array.isArray(out) ? out[0] : out
  return new File([blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), { type: 'image/jpeg' })
}

// 파일 → (HEIC 변환) → maxDim 으로 리사이즈한 canvas 반환
async function toCanvas(inputFile, maxDim) {
  let file = inputFile
  if (isHeic(file)) {
    try {
      file = await heicToJpeg(file)
    } catch {
      throw new Error('HEIC 사진 변환에 실패했습니다.')
    }
  }
  const img = await loadImage(file)
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
  const w = Math.round(img.width * scale)
  const h = Math.round(img.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  canvas.getContext('2d').drawImage(img, 0, 0, w, h)
  return { canvas, w, h }
}

export function useImageCompress() {
  // 단일 파일 → 압축된 jpeg dataURL (Firestore dataURL 방식 — 1MB 한도용, 레거시)
  async function compress(inputFile) {
    const { canvas, w, h } = await toCanvas(inputFile, MAX_DIM)
    let quality = 0.72
    let dataUrl = canvas.toDataURL('image/jpeg', quality)
    while (dataUrlBytes(dataUrl) > MAX_BYTES && quality > 0.4) {
      quality -= 0.1
      dataUrl = canvas.toDataURL('image/jpeg', quality)
    }
    return { dataUrl, width: w, height: h, bytes: dataUrlBytes(dataUrl) }
  }

  // 단일 파일 → 압축된 jpeg Blob (Firebase Storage 업로드용 — 1MB 한도 없음, 고화질)
  // opts.maxDim: 최대 변, opts.quality: jpeg 품질
  async function compressToBlob(inputFile, { maxDim = 1920, quality = 0.85 } = {}) {
    const { canvas, w, h } = await toCanvas(inputFile, maxDim)
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('이미지 변환 실패'))),
        'image/jpeg',
        quality
      )
    })
    return { blob, width: w, height: h, bytes: blob.size }
  }

  return { compress, compressToBlob }
}
