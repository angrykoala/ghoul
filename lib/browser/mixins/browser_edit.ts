import BrowserInfo from './browser_info';

import { WendigoSelector } from '../../types';
import { WendigoError, QueryError } from '../../errors';

// Mixin with methods to edit the DOM and state
export default abstract class BrowserEdit extends BrowserInfo {
    public async addClass(selector: WendigoSelector, className: string): Promise<void> {
        this._failIfNotLoaded("addClass");
        try {
            const rawClasses = await this.attribute(selector, "class");
            await this.setAttribute(selector, "class", `${rawClasses} ${className}`);
        } catch (err) {
            throw WendigoError.overrideFnName(err, "addClass");
        }
    }

    public async removeClass(selector: WendigoSelector, className: string): Promise<void> {
        this._failIfNotLoaded("removeClass");
        try {
            const classList = await this.class(selector);
            const finalClassList = classList.filter((cl) => {
                return cl !== className;
            });
            await this.setAttribute(selector, "class", finalClassList.join(" "));
        } catch (err) {
            throw WendigoError.overrideFnName(err, "removeClass");
        }
    }

    public async setAttribute(selector: WendigoSelector, attribute: string, value: string): Promise<void> {
        this._failIfNotLoaded("setAttribute");
        try {
            await this.evaluate((q, attr, val) => {
                const element = WendigoUtils.queryElement(q);
                if (val === null) element.removeAttribute(attr);
                else element.setAttribute(attr, val);
            }, selector, attribute, value);
        } catch (err) {
            throw new QueryError("setAttribute", `Element "${selector}" not found.`);
        }
    }
}