/* global WendigoUtils */
"use strict";

const DomElement = require('../models/dom_element');
const utils = require('../utils/utils');
const {FatalError, QueryError} = require('../errors');

module.exports = function BrowserActionsMixin(s) {
    return class BrowserActions extends s {
        type(selector, text) {
            this._failIfNotLoaded();
            if (typeof selector === "string") {
                return this.page.type(selector, text);
            } else if (selector instanceof DomElement) {
                return selector.element.type(text);
            } else return Promise.reject(new FatalError(`Invalid selector on "browser.type".`));
        }

        keyPress(key, count = 1) {
            this._failIfNotLoaded();
            if (!Array.isArray(key)) key = [key];
            const funcs = key.map(k => () => this.page.keyboard.press(k));
            let funcsFinal = [];
            for (let i = 0; i < count; i++) {
                funcsFinal = funcsFinal.concat(funcs);
            }
            return utils.promiseSerial(funcsFinal).catch(() => {
                return Promise.reject(new Error(`Could not press keys "${key.join(", ")}"`));
            });
        }

        uploadFile(selector, path) {
            this._failIfNotLoaded();
            return this.query(selector).then(fileInput => {
                if (fileInput) {
                    return fileInput.element.uploadFile(path);
                } else {
                    const error = new QueryError(`Selector "${selector}" doesn't match any element to upload file.`);
                    return Promise.reject(error);
                }
            });
        }

        select(selector, values) {
            this._failIfNotLoaded();
            if (!Array.isArray(values)) values = [values];
            return this.page.select(selector, ...values).catch(() => {
                const error = new QueryError(`Element "${selector}" not found when trying to select value.`);
                return Promise.reject(error);
            });
        }

        clearValue(selector) {
            this._failIfNotLoaded();
            return this.evaluate((q) => {
                const elements = WendigoUtils.queryAll(q);
                for (const element of elements) {
                    element.value = "";
                }
            }, selector);
        }

        setValue(selector, value) {
            this._failIfNotLoaded();
            return this.evaluate((q, v) => {
                const elements = WendigoUtils.queryAll(q);
                if (elements.length === 0) return Promise.reject();
                for (const element of elements) {
                    element.value = v;
                }
                return elements.length;
            }, selector, value).catch(() => {
                const error = new QueryError(`Element "${selector}" not found when trying to set value "${value}".`);
                return Promise.reject(error);
            });
        }

        click(selector, index) {
            this._failIfNotLoaded();
            if (typeof selector === 'number' && typeof index === 'number') {
                return this.evaluate((evalX, evalY) => {
                    const elem = document.elementFromPoint(evalX, evalY);
                    if (!elem) return 0;
                    else {
                        elem.click();
                        return 1;
                    }
                }, selector, index).then((elements) => {
                    if (elements === 0) {
                        const error = new QueryError(`No element in position [${selector}, ${index}] found when trying to click.`);
                        return Promise.reject(error);
                    } else return elements;
                });
            }

            return this.queryAll(selector).then((elements) => {
                if (index !== undefined) {
                    if (index > elements.length || index < 0) {
                        const errorMsg = `browser.click, invalid index "${index}" for selector "${selector}", ${elements.length} elements found.`;
                        const error = new QueryError(errorMsg);
                        return Promise.reject(error);
                    }
                    elements[index].click();
                    return 1;
                } else {
                    if (elements.length <= 0) {
                        const error = new QueryError(`No element "${selector}" found when trying to click.`);
                        return Promise.reject(error);
                    }
                    return Promise.all(elements.map((e) => e.click())).then(() => {
                        return elements.length;
                    });
                }
            });
        }

        clickText(text, optionalText, index) {
            this._failIfNotLoaded();
            if (typeof optionalText === 'number' && index === undefined) {
                index = optionalText;
                optionalText = undefined;
            }
            return this.findByText(text, optionalText).then((elements) => {
                if (elements.length <= 0) {
                    const error = new QueryError(`No element with text "${optionalText || text}" found when trying to click.`);
                    return Promise.reject(error);
                }
                if (index !== undefined) {
                    if (index > elements.length || index < 0) {
                        const errorMsg = `browser.click, invalid index "${index}" for text "${optionalText || text}", ${elements.length} elements found.`;
                        const error = new QueryError(errorMsg);
                        return Promise.reject(error);
                    }
                    return this.click(elements[index]);
                } else return this.click(elements);
            });
        }

        check(selector) {
            this._failIfNotLoaded();
            return this.evaluate((q) => {
                const element = WendigoUtils.queryElement(q);
                if (!element) return Promise.reject();
                element.checked = true;
            }, selector).catch(() => {
                const error = new QueryError(`Element "${selector}" not found when trying to check.`);
                return Promise.reject(error);
            });
        }

        uncheck(selector) {
            this._failIfNotLoaded();
            return this.evaluate((q) => {
                const element = WendigoUtils.queryElement(q);
                if (!element) return Promise.reject();
                element.checked = false;
            }, selector).catch(() => {
                const error = new QueryError(`Element "${selector}" not found when trying to uncheck.`);
                return Promise.reject(error);
            });
        }

        focus(selector) {
            this._failIfNotLoaded();
            return this.page.focus(selector).catch(() => {
                const error = new QueryError(`Element "${selector}" not found when trying to focus.`);
                return Promise.reject(error);
            });
        }

        hover(selector) {
            this._failIfNotLoaded();
            return this.page.hover(selector).catch(() => {
                const error = new QueryError(`Element "${selector}" not found when trying to hover.`);
                return Promise.reject(error);
            });
        }

        scroll(value, xvalue) {
            this._failIfNotLoaded();
            return this.evaluate((val, xval) => {
                if (typeof val === 'number') {
                    if (typeof xval !== 'number') xval = window.scrollX;
                    window.scroll(xval, val);
                } else {
                    const element = WendigoUtils.queryElement(val);
                    element.scrollIntoView();
                }
            }, value, xvalue).catch(() => {
                return Promise.reject(new QueryError(`Selector ".not-exists" doesn't match any element to scroll.`));
            });
        }
    };
};
