// Landing page interactions

import { DOM } from '../core/dom.js';
import { Logger, toggleClass } from '../core/utils.js';
import { I18N } from '../i18n/i18n.js';

class LandingController {
    constructor() {
        this._initialized = false;
        this._isOpen = false;
    }

    init() {
        if (this._initialized) return;

        this._bindEvents();
        this._initialized = true;
        Logger.log('Landing', 'Initialized');
    }

    _bindEvents() {
        const openButtons = DOM.gameOpenButtons;
        const closeButtons = DOM.gameModalClose;
        const modal = DOM.gameModal;

        openButtons?.forEach((button) => {
            button.addEventListener('click', () => this.openGameModal());
        });

        closeButtons?.forEach((button) => {
            button.addEventListener('click', () => this.closeGameModal());
        });

        modal?.addEventListener('click', (event) => {
            if (event.target === modal) {
                this.closeGameModal();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this._isOpen) {
                this.closeGameModal();
            }
        });

        document.addEventListener('languageChanged', () => {
            this._syncModalContent();
        });

        this._syncModalContent();
    }

    _syncModalContent() {
        const modal = DOM.gameModal;
        const link = DOM.gameModalLink;

        if (!modal || !link) return;

        modal.setAttribute('aria-hidden', String(!this._isOpen));
        link.textContent = I18N.t('home.realGame') || link.textContent;
    }

    openGameModal() {
        const modal = DOM.gameModal;
        if (!modal) return;

        this._isOpen = true;
        modal.hidden = false;
        modal.setAttribute('aria-hidden', 'false');
        toggleClass(modal, 'is-open', true);
        document.body.classList.add('modal-open');
        DOM.gameModalLink?.focus();
    }

    closeGameModal() {
        const modal = DOM.gameModal;
        if (!modal) return;

        this._isOpen = false;
        toggleClass(modal, 'is-open', false);
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');

        window.setTimeout(() => {
            if (!this._isOpen) {
                modal.hidden = true;
            }
        }, 220);
    }
}

export const Landing = new LandingController();
export const initLanding = () => Landing.init();