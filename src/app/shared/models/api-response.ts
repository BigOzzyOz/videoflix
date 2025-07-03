export class ApiResponse {
    ok: boolean;
    status: number;
    data: any;
    message?: string;

    constructor(ok: boolean, status: number, data: any, message?: string) {
        this.ok = ok;
        this.status = status;
        this.data = data;
        this.message = message;
    }

    static async create(response: Response): Promise<ApiResponse> {
        const contentLength = response.headers.get('content-length');
        const contentType = response.headers.get('content-type');

        if (contentLength === '0' || response.status === 204 || response.status === 205) {
            return new ApiResponse(response.ok, response.status, null, 'No content');
        }

        let data = null;
        let message = '';

        try {
            if (contentType?.includes('application/json')) {
                const responseText = await response.text();
                if (responseText.trim() !== '') {
                    data = JSON.parse(responseText);
                }
            } else {
                data = await response.text();
            }
        } catch (error) {
            console.error('Error parsing response:', error);
            message = `Parse error: ${error}`;
            data = null;
        }

        return new ApiResponse(response.ok, response.status, data, message);
    }

    isSuccess(): boolean {
        return this.ok && this.status >= 200 && this.status < 300;
    }

    isClientError(): boolean {
        return this.status >= 400 && this.status < 500;
    }

    isServerError(): boolean {
        return this.status >= 500;
    }

    isUnauthorized(): boolean {
        return this.status === 401;
    }

    isForbidden(): boolean {
        return this.status === 403;
    }

    isNotFound(): boolean {
        return this.status === 404;
    }

    hasData(): boolean {
        return this.data !== null && this.data !== undefined;
    }

    getErrorMessage(): string {
        if (this.message) return this.message;
        if (this.data && typeof this.data === 'object' && this.data.message) {
            return this.data.message;
        }
        if (this.data && typeof this.data === 'object' && this.data.error) {
            return this.data.error;
        }
        return `HTTP ${this.status}`;
    }
}
