import { createHash } from 'node:crypto'
export function sha256(password: string) {
  return createHash('sha256').update(password).digest('hex')
}
export function hashPassword(password: string) {
    // chỗ này muốn tăng thêm độ bảo mật thì cho + thêm vài kí tự đặc biệt nữa 
  return sha256(password)
}
