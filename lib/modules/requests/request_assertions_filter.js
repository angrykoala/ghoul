"use strict";

const {AssertionError} = require('../../errors');
const utils = require('../../utils');

module.exports = class RequestAssertionsFilter extends Promise {
    constructor(executor, requestFilter) {
        super((resolve, reject) => {
            return executor(resolve, reject);
        });

        this._requestFilter = requestFilter;
    }

    url(expected, msg) {
        const urlFilter = this._requestFilter.url(expected);
        if (!msg) msg = `Expected request with url "${expected}" to exist.`;
        return this._assertFilter(urlFilter, msg);
    }

    method(expected, msg) {
        const methodFilter = this._requestFilter.method(expected);
        if (!msg) msg = `Expected request with method "${expected}" to exist.`;
        return this._assertFilter(methodFilter, msg);
    }

    status(expected, msg) {
        const statusFilter = this._requestFilter.status(expected);
        if (!msg) msg = `Expected request with status "${expected}" to exist.`;
        return this._assertFilter(statusFilter, msg);
    }

    responseHeaders(expected, msg) {
        const responseHeadersFilter = this._requestFilter.responseHeaders(expected);
        if (!msg) {
            const keys = Object.keys(expected);
            const expectedText = keys.map((k) => {
                return `${k}: ${expected[k]}`;
            }).join(", ");
            msg = `Expected response with headers "${expectedText}" to exist.`;
        }
        return this._assertFilter(responseHeadersFilter, msg);
    }

    ok(expected = true, msg) {
        const okFilter = this._requestFilter.ok(expected);
        if (!msg) msg = `Expected ${expected ? "" : "not"} ok request to exist.`;
        return this._assertFilter(okFilter, msg);
    }

    postBody(expected, msg) {
        const bodyFilter = this._requestFilter.postBody(expected);
        if (!msg) {
            const expectedString = utils.stringify(expected);
            msg = `Expected request with body "${expectedString}" to exist.`;
        }
        return this._assertFilter(bodyFilter, msg);
    }

    responseBody(expected, msg) {
        const responseBodyFilter = this._requestFilter.responseBody(expected);
        if (!msg) {
            const expectedString = utils.stringify(expected);
            msg = `Expected request with response body "${expectedString}" to exist.`;
        }
        return this._assertFilter(responseBodyFilter, msg);
    }

    exactly(expected, msg) {
        return new RequestAssertionsFilter((resolve, reject) => {
            this.then(() => {
                return this._assertNumber(expected, msg, resolve, reject);
            }).catch(() => {
                // Empty Catch
            });
            this.catch((err) => {
                if (err instanceof AssertionError) {
                    return this._assertNumber(expected, msg, resolve, reject);
                } else reject(err);
            });
        }, this._requestFilter);
    }

    _assertFilter(filter, msg) {
        return new RequestAssertionsFilter((resolve, reject) => {
            return this.then(() => {
                return filter.requests.then((reqs) => {
                    if (reqs.length > 0) resolve();
                    else {
                        const err = new AssertionError(msg);
                        reject(err);
                    }
                });
            }).catch((err) => {
                reject(err);
            });
        }, filter);
    }

    _assertNumber(expected, msg, resolve, reject) {
        return this._requestFilter.requests.then((reqs) => {
            const requestsNumber = reqs.length;
            if (!msg) msg = `Expected exactly ${expected} requests, ${requestsNumber} found.`;
            if (requestsNumber === expected) return Promise.resolve();
            else {
                const err = new AssertionError(msg);
                return Promise.reject(err);
            }
        }).then(() => {
            resolve();
        }).catch((err) => {
            reject(err);
        });
    }
};
