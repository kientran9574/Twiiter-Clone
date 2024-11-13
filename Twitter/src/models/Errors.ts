// Trong này sẽ tạo nhiều obj error

import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'

// bình thường mà mình tạo 1 class error bất kì thì mình phải cho nó kế thừa Error ,để cho nó nhận đc cái thông tin lỗi tại dòng nào luôn

type ErrorsType = Record<
  string,
  {
    msg: string
    [key: string]: any
  }
> // => { [key: string]: string }

// Không cho kế thừa => học hết chương này thì học lại tìm chỗ này

// Cấu hình dạng error json mà mình muốn
export class ErrorWithStatus {
  message: string
  status: number
  constructor({ message, status }: { message: string; status: number }) {
    ;(this.message = message), (this.status = status)
  }
}

// 422
export class EntityError extends ErrorWithStatus {
  errors: ErrorsType
  constructor({ message = USERS_MESSAGES.VALIDATION_ERROR, errors }: { message?: string; errors: ErrorsType }) {
    // truyền giá trị mặc định cho key status lên cho thằng ErrorWithStatus
    super({ message, status: HTTP_STATUS.UNPROCESSABLE_ENTITY })
    // lấy từ cái mình truyền vào
    this.errors = errors
  }
}
