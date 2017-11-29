/**
 * 정의되지 않은 메서드에 대해서 요청을 받았을 때 던지는 에러
 */
class MethodError extends Error {
  constructor(message='Method not Allowed') {
    super(message)
    this.name = 'MethodError'
    this.code = 405
  }
}

/**
 * QueryString, Request Body 등이 요구조건을 만족하지 않을 때 던지는 에러
 */
class ParameterError extends Error {
  constructor(message) {
    super(message='Precondition Failed')
    this.name = 'ParameterError'
    this.code = 412
  }
}

module.exports = { ParameterError, MethodError }