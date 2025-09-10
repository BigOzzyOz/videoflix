/**
 * Represents an HTTP API response with status, data, and error handling helpers.
 */
export class ApiResponse {
    ok: boolean;
    status: number;
    data: any;
    message?: string;

    /**
     * Create a new ApiResponse instance.
     */
    constructor(ok: boolean, status: number, data: any, message?: string) {
        this.ok = ok;
        this.status = status;
        this.data = data;
        this.message = message;
    }

    /**
     * Build ApiResponse from a fetch Response object.
     */
    static async create(response: Response): Promise<ApiResponse> {
        const contentLength = response.headers.get('content-length');
        const contentType = response.headers.get('content-type');
        if (this.isNoContentStatus(response, contentLength)) {
            return new ApiResponse(response.ok, response.status, null, 'No content');
        }
        const { data, message } = await this.parseResponseData(response, contentType);
        return new ApiResponse(response.ok, response.status, data, message);
    }

    /**
     * Parse response data (JSON or text).
     */
    private static async parseResponseData(response: Response, contentType: string | null): Promise<{ data: any, message: string }> {
        try {
            if (contentType?.includes('application/json')) {
                const responseText = await response.text();
                if (responseText.trim() !== '') return { data: JSON.parse(responseText), message: '' };
                else return { data: null, message: '' };
            } else return { data: await response.text(), message: '' };
        } catch (error) {
            console.error('Error parsing response:', error);
            return { data: null, message: `Parse error: ${error}` };
        }
    }

    /**
     * True if response has no content (204, 205, or Content-Length 0).
     */
    private static isNoContentStatus(response: Response, contentLength: string | null): boolean {
        return contentLength === '0' || response.status === 204 || response.status === 205;
    }

    /** True if status is 2xx. */
    isSuccess(): boolean {
        return this.ok && this.status >= 200 && this.status < 300;
    }
    /** True if status is 4xx. */
    isClientError(): boolean {
        return this.status >= 400 && this.status < 500;
    }
    /** True if status is 5xx. */
    isServerError(): boolean {
        return this.status >= 500;
    }
    /** True if status is 401. */
    isUnauthorized(): boolean {
        return this.status === 401;
    }
    /** True if status is 403. */
    isForbidden(): boolean {
        return this.status === 403;
    }
    /** True if status is 404. */
    isNotFound(): boolean {
        return this.status === 404;
    }
    /** True if response has data. */
    hasData(): boolean {
        return this.data !== null && this.data !== undefined;
    }
    /**
     * Returns error message (message, data.message, data.error, or status).
     */
    getErrorMessage(): string {
        if (this.message) return this.message;
        if (this.data && typeof this.data === 'object' && this.data.message) return this.data.message;
        if (this.data && typeof this.data === 'object' && this.data.error) return this.data.error;
        return `HTTP ${this.status}`;
    }
}
