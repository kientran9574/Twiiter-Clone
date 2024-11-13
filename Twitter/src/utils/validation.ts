import { NextFunction, Request, Response } from 'express'
import { validationResult, ContextRunner } from 'express-validator'
import HTTP_STATUS from '~/constants/httpStatus'
import { EntityError, ErrorWithStatus } from '~/models/Errors'

export const validate = (validations: ContextRunner[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Thực hiện tất cả các validation song song
    await Promise.all(validations.map((validation) => validation.run(req)))
    // Kiểm tra kết quả validation sau khi tất cả đã hoàn thành
    const errors = validationResult(req)
    // console.log('🚀 ~ return ~ errors:', errors)
    // Không có lỗi thì next tiếp tục request
    if (errors.isEmpty()) {
      return next()
    }

    const errorsObject = errors.mapped()
    // console.log('🚀 ~ return ~ errorsObject:', errorsObject)
    const entityError = new EntityError({ errors: {} }) // Mình cho obj rỗng ban đầu là vì . Qua mỗi cái vòng lặp thì mình sẽ ép 1 cái thuộc tính vào trong cái error

    for (const key in errorsObject) {
      const { msg }: any = errorsObject[key]
      console.log('obj key', errorsObject[key])
      // Trả về lỗi không phải là lỗi do validate
      if (msg instanceof ErrorWithStatus && msg.status !== HTTP_STATUS.UNPROCESSABLE_ENTITY) {
        // mình sẽ không xử lý trả err trong cái thằng validation này mình sẽ dồn err vào trong cái thằng index.ts app
        return next(msg)
      }

      // 422
      // đây là mình sẽ ép vào 1 obj với những cái thuộc tính vào trong cái errors
      entityError.errors[key] = errorsObject[key]
      // console.log('123456789', entityError.errors)
      // console.log('123456', entityError.errors[key])
      // console.log('123', (entityError.errors[key] = errorsObject[key]))
    }
    next(entityError)
    // Trả về lỗi nếu có
    // return res.status(400).json({ errors: errors.mapped() })
  }
}
