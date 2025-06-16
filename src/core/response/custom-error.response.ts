export class CustomErrorResponse<T = null> {
  constructor(
    public statusCode: number,
    public message: string | string[],
    public success: boolean = false,
    public data: T | null = null,
    public timestamp: string = new Date().toISOString(),
  ) {}
}
