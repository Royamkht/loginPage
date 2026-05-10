import type { APIRequestContext } from "@playwright/test";
import { APIlogger } from "./logger";

/** Inline steps without importing `test` from @playwright/test (avoids loader/suite confusion when this module is bundled with fixtures). */
async function apiStep<T>(_title: string, fn: () => Promise<T>): Promise<T> {
    return fn();
}

export class RequestHandler {
    private request: APIRequestContext
    private baseUrl: string | undefined
    private defaultBaseUrl: string
    private apiPath: string = ''
    private queryParams: object = {}
    private apiHeaders: Record<string, string> = {}
    private apiBody: object = {}
    private logger: APIlogger

    constructor(request: APIRequestContext, apiBaseUrl: string, logger: APIlogger) {
        this.request = request
        this.defaultBaseUrl = apiBaseUrl
        this.logger = logger
    }

    url(url: string) {
        this.baseUrl = url
        return this

    }
    path(path: string) {
        this.apiPath = path
        return this

    }
    params(params: object) {
        this.queryParams = params
        return this


    }
    headers(headers: Record<string, string>) {
        this.apiHeaders = headers
        return this

    }
    body(body: object) {
        this.apiBody = body
        return this

    }
    async getRequest(statusCode: number) {
        let responseJSON: any
        const url = this.getUrl()
        await apiStep(`Get request to: ${url}`, async () => {
            this.logger.logRequest('GET', url, this.apiHeaders)
            const response = this.request.get(url, {
                headers: this.apiHeaders
            })
            this.cleanupFields()
            const actualStatus = (await response).status()
            responseJSON = (await response).json()
            this.logger.logResponse(actualStatus, responseJSON)
            this.statusCodeValidator(actualStatus, statusCode, this.getRequest)
        })




        return responseJSON
    }

    async postRequest(statusCode: number) {
        let responseJSON: any
        const url = this.getUrl()
        await apiStep(`Post request to: ${url}`, async () => {
            this.logger.logRequest('POST', url, this.apiHeaders, this.apiBody)
            const response = this.request.post(url, {
                headers: this.apiHeaders,
                data: this.apiBody
            })
            this.cleanupFields()
            const actualStatus = (await response).status()
            responseJSON = (await response).json()
            this.logger.logResponse(actualStatus, responseJSON)
            this.statusCodeValidator(actualStatus, statusCode, this.postRequest)
        })

        return responseJSON
    }

    async puttRequest(statusCode: number) {
        let responseJSON: any
        const url = this.getUrl()
        await apiStep(`Put request to: ${url}`, async () => {
            this.logger.logRequest('PUT', url, this.apiHeaders, this.apiBody)
            const response = this.request.put(url, {
                headers: this.apiHeaders,
                data: this.apiBody
            })
            this.cleanupFields()
            const actualStatus = (await response).status()
            responseJSON = (await response).json()
            this.logger.logResponse(actualStatus, responseJSON)
            this.statusCodeValidator(actualStatus, statusCode, this.puttRequest)

        })

        return responseJSON
    }

    async deleteRequest(statusCode: number) {

        const url = this.getUrl()
        await apiStep(`Delete request to: ${url}`, async () => {
            this.logger.logRequest('DELETE', url, this.apiHeaders)
            const response = this.request.delete(url, {
                headers: this.apiHeaders
            })
            this.cleanupFields()
            const actualStatus = (await response).status()
            this.logger.logResponse(actualStatus)
            this.statusCodeValidator(actualStatus, statusCode, this.deleteRequest)

        })



    }


    private getUrl() {
        const url = new URL(`${this.baseUrl ?? this.defaultBaseUrl}${this.apiPath}`)
        for (const [key, value] of Object.entries(this.queryParams)) {
            url.searchParams.append(key, value)
        }
        return url.toString()
    }


    private statusCodeValidator(actualStatus: number, expectStatus: number, callingMethod: Function) {


        if (actualStatus !== expectStatus) {
            const logs = this.logger.getRecentLogs()
            const error = new Error(`Expected status ${expectStatus} but got ${actualStatus}\n\nRecently API activity: \n${logs}`)
            Error.captureStackTrace(error, callingMethod)
            throw error
        }
    }

    private cleanupFields() {
        this.apiBody = {}
        this.apiHeaders = {}
        this.baseUrl = undefined
        this.apiPath = ''
        this.queryParams = {}
    }
}