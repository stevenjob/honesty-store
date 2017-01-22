export interface ApiResponse<T> {
    response?: T;
    error?: { message: string };
}