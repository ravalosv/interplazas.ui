export class ApiReturn<T> {
  success: boolean;
  error: string;
  data: T;
}
