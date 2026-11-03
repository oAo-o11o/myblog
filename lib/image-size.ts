/**
 * 零依赖图片尺寸探测：只读文件头，不解码像素。
 * 支持 JPEG / PNG / GIF / WebP（VP8 / VP8L / VP8X）。
 * 用途：上传时记录真实宽高，避免影响瀑布流比例。
 */

export interface ImageDims {
  width: number
  height: number
  type: 'jpeg' | 'png' | 'gif' | 'webp' | 'unknown'
}

export function probeImageSize(buf: Buffer): ImageDims | null {
  const none: ImageDims = { width: 0, height: 0, type: 'unknown' }

  // PNG
  if (
    buf.length > 24 &&
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
  ) {
    return { type: 'png', width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
  }

  // GIF
  if (buf.length > 10 && buf.toString('ascii', 0, 3) === 'GIF') {
    return { type: 'gif', width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) }
  }

  // WebP
  if (
    buf.length > 30 &&
    buf.toString('ascii', 0, 4) === 'RIFF' &&
    buf.toString('ascii', 8, 12) === 'WEBP'
  ) {
    const chunk = buf.toString('ascii', 12, 16)
    if (chunk === 'VP8 ') {
      // 有损：3 字节同步码后是 14 bit 宽高
      return {
        type: 'webp',
        width: buf.readUInt16LE(26) & 0x3fff,
        height: buf.readUInt16LE(28) & 0x3fff,
      }
    }
    if (chunk === 'VP8L') {
      // 无损：1 字节签名 + 14bit 宽 + 14bit 高
      const b = buf.readUInt32LE(21)
      return {
        type: 'webp',
        width: (b & 0x3fff) + 1,
        height: ((b >> 14) & 0x3fff) + 1,
      }
    }
    if (chunk === 'VP8X') {
      const w = 1 + (buf[24] | (buf[25] << 8) | (buf[26] << 16))
      const h = 1 + (buf[27] | (buf[28] << 8) | (buf[29] << 16))
      return { type: 'webp', width: w, height: h }
    }
    return none
  }

  // JPEG：扫描 SOFn 段
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let off = 2
    while (off + 9 < buf.length) {
      if (buf[off] !== 0xff) {
        off++
        continue
      }
      const marker = buf[off + 1]
      // 填充字节
      if (marker === 0xff) {
        off++
        continue
      }
      // 无载荷段
      if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
        off += 2
        continue
      }
      const len = buf.readUInt16BE(off + 2)
      const isSOF =
        (marker >= 0xc0 && marker <= 0xc3) ||
        (marker >= 0xc5 && marker <= 0xc7) ||
        (marker >= 0xc9 && marker <= 0xcb) ||
        (marker >= 0xcd && marker <= 0xcf)
      if (isSOF) {
        return {
          type: 'jpeg',
          height: buf.readUInt16BE(off + 5),
          width: buf.readUInt16BE(off + 7),
        }
      }
      if (len < 2) break
      off += 2 + len
    }
  }

  return null
}
