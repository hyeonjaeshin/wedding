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
    img.onerror = (e) => {
      URL.revokeObjectURL(url)
      reject(e)
    }
    img.src = url
  })
}

// dataURL 의 대략적 바이트 수 (base64 길이 기반)
function dataUrlBytes(dataUrl) {
  const i = dataUrl.indexOf(',')
  return Math.ceil(((dataUrl.length - i - 1) * 3) / 4)
}

export function useImageCompress() {
  // 단일 파일 → 압축된 jpeg dataURL
  async function compress(file) {
    const img = await loadImage(file)

    const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height))
    const w = Math.round(img.width * scale)
    const h = Math.round(img.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, w, h)

    // 품질을 단계적으로 낮춰 목표 용량 이하로 맞춘다
    let quality = 0.72
    let dataUrl = canvas.toDataURL('image/jpeg', quality)
    while (dataUrlBytes(dataUrl) > MAX_BYTES && quality > 0.4) {
      quality -= 0.1
      dataUrl = canvas.toDataURL('image/jpeg', quality)
    }

    return { dataUrl, width: w, height: h, bytes: dataUrlBytes(dataUrl) }
  }

  return { compress }
}
