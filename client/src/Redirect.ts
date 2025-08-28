export class Redirect {

    url : URL;

    static redirectIfNecassary() {
        let redirect = new Redirect();
        redirect.url = new URL(window.location.toString());
        if (redirect.shouldRedirect()) {
            window.location.replace(redirect.getNewUrl());
        }
    }

    getNewUrl() {
        let newUrl = 'https://'
            + this.removeWWWFromHostname()
            + (this.url.pathname.length > 1 ? this.url.pathname : '')
            + this.url.search;
        if (newUrl.endsWith('/')) {
            newUrl = newUrl.substring(0, newUrl.length - 1);
        }
        return newUrl;
    }

    removeWWWFromHostname() {
        if (this.hasWWW()) {
            return this.url.hostname.substring(4);
        } else {
            return this.url.hostname;
        }
    }

    hasWWW() : boolean {
        return this.url.hostname.startsWith('www.');
    }

    shouldRedirect() : boolean {
        return !(this.url.hostname === 'localhost') && (this.unsecureProtocol() || this.hasWWW());
    }

    unsecureProtocol(): boolean {
        return this.url.protocol === 'http:';
    }
}