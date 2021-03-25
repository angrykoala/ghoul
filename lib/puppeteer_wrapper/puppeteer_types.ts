import { Viewport } from "puppeteer";

export type ViewportOptions = Partial<Viewport>;

import { Protocol } from 'puppeteer'

export {
  HTTPResponse, HTTPRequest, ElementHandle, GeolocationOptions, WaitForOptions, WebWorker,
  Page, Frame, Viewport, EvaluateFn, SerializableOrJSHandle, JSHandle,
  Browser, Keyboard, Mouse, WaitForSelectorOptions,
  Touchscreen, PDFOptions, ConsoleMessage, ConsoleMessageType, ScreenshotOptions,
  ResourceType, Dialog, BrowserContext, Target, Permission, errors as PuppeteerErrors
} from 'puppeteer';

export type Cookie = Protocol.Network.Cookie
export type SetCookie = Protocol.Network.CookieParam
export type DeleteCookie = Protocol.Network.DeleteCookiesRequest
export type DialogType = Protocol.Page.DialogType

export type ScriptTagOptions = {
  url?: string;
  path?: string;
  content?: string;
  type?: string;
}

export type MediaFeature = {
  name: string;
  value: string;
}
