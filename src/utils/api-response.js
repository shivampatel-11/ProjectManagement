class ApiResponse {
    constructor(statusCode,data,message = "Success"){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400    // it means if value is less than 400 it will return true else false 
    }
}

export { ApiResponse };