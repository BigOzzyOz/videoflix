export class ApiResponse {
    ok: boolean;
    status: number;
    data: { [key: string]: any } | null = null;

    private constructor(ok: boolean, status: number, data: any) {
        this.ok = ok;
        this.status = status;
        this.data = data;
    }

    static async create(response: Response): Promise<ApiResponse> {
        let data = null;
        try {
            data = await response.json();
        } catch (error) {
            console.error('Error parsing JSON:', error);
        }
        return new ApiResponse(response.ok ?? false, response.status ?? 500, data);
    }
}
