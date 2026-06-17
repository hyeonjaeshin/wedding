// 정적 갤러리/커버 사진을 웹용으로 리사이즈·압축하는 1회성 스크립트.
//   실행: npm run optimize:images
// - 대상: public/images/cover, public/images/gallery 의 jpg/jpeg/png
// - 처리: 가로 max 1600px 리사이즈 + JPEG quality 80 으로 "제자리 덮어쓰기"
// - 멱등: 이미 가로 ≤ MAX_WIDTH 이고 용량이 작으면 건너뜀(재실행 안전)
// ⚠️ public 사본을 덮어쓰므로 원본은 별도(카메라 등)에 보관하세요.
import { readdir, stat, rename, unlink } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const TARGET_DIRS = ['public/images/cover', 'public/images/gallery']

const MAX_WIDTH = 1600
const JPEG_QUALITY = 80
const SKIP_BYTES = 800 * 1024 // 이미 800KB 미만 + 충분히 작으면 스킵
const exts = new Set(['.jpg', '.jpeg', '.png'])

const fmtKB = (b) => (b / 1024).toFixed(0) + 'KB'

let totalBefore = 0
let totalAfter = 0
let processed = 0
let skipped = 0

for (const rel of TARGET_DIRS) {
  const dir = path.join(ROOT, rel)
  let files = []
  try {
    files = await readdir(dir)
  } catch {
    continue // 폴더 없으면 패스
  }

  for (const name of files) {
    const ext = path.extname(name).toLowerCase()
    if (!exts.has(ext)) continue

    const filePath = path.join(dir, name)
    const before = (await stat(filePath)).size
    const meta = await sharp(filePath).metadata()

    if ((meta.width ?? 0) <= MAX_WIDTH && before < SKIP_BYTES) {
      skipped++
      totalBefore += before
      totalAfter += before
      continue
    }

    // 원본을 .tmp 로 변환 후 교체 (png도 jpg 로 통일하지 않고 포맷 유지)
    const tmp = filePath + '.tmp'
    const pipeline = sharp(filePath).rotate().resize({
      width: MAX_WIDTH,
      withoutEnlargement: true,
    })
    if (ext === '.png') {
      await pipeline.png({ quality: JPEG_QUALITY, compressionLevel: 9 }).toFile(tmp)
    } else {
      await pipeline.jpeg({ quality: JPEG_QUALITY, progressive: true, mozjpeg: true }).toFile(tmp)
    }

    const after = (await stat(tmp)).size
    // 더 커졌으면(이미 최적화됨) 원본 유지
    if (after >= before) {
      await unlink(tmp)
      skipped++
      totalBefore += before
      totalAfter += before
      console.log(`= ${rel}/${name}  ${fmtKB(before)} (유지)`)
      continue
    }

    await unlink(filePath)
    await rename(tmp, filePath)
    processed++
    totalBefore += before
    totalAfter += after
    console.log(`✓ ${rel}/${name}  ${fmtKB(before)} → ${fmtKB(after)}  (${meta.width}px→${Math.min(meta.width, MAX_WIDTH)}px)`)
  }
}

console.log('\n────────────────────────────')
console.log(`처리 ${processed}개 · 스킵 ${skipped}개`)
console.log(`총합 ${fmtKB(totalBefore)} → ${fmtKB(totalAfter)}  (${(100 - (totalAfter / totalBefore) * 100).toFixed(0)}% 감소)`)
