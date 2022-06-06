import { dispatch } from '~/core';
import RequestService from './request';

interface GeneralSettingsRequest {
    ['branding.name']: string;
    ['misc.databases_allow_random']: boolean;
    ['misc.required_2fa']: number;
    ['default_locale']: string;
}

interface EmbedSettingsRequest {
    ['og.site_name']: string;
    ['og.title']: string;
    ['og.description']: string;
    ['og.image']: string;
}

interface JSSettingsRequest {
    js: string;
}

interface CSSSettingsRequest {
    css: string;
}

interface SSOSettingsRequest {
    ['whmcs.enabled']: boolean;
    ['whmcs.button_text']: string;
    ['whmcs.url']: string;
    ['whmcs.client_id']: string;
    ['whmcs.client_secret']: string;
    ['whmcs.api_id']: string;
    ['whmcs.api_secret']: string;
}

interface AssetRequest {
    asset?: File;
}

class SettingsService {
    fetchAsset(url: string) {
        // Avoid using axios due to CORS
        return fetch(url)
            .then(res => res.text());
    }

    updateGeneral(data: GeneralSettingsRequest) {
        // TODO: check if lang should change
        return RequestService.post('/settings/general', data)
            .then(() => dispatch('settings/update', data));
    }

    updateEmbed(data: EmbedSettingsRequest) {
        return RequestService.post('/settings/embed', data)
            .then(() => dispatch('settings/update', data));
    }

    updateJS(data: JSSettingsRequest) {
        return RequestService.post('/settings/js', data)
            .then(({ url }) => dispatch('settings/update', { injector: { js: url } }));
    }

    updateCSS(data: CSSSettingsRequest) {
        return RequestService.post('/settings/css', data)
            .then(({ url }) => dispatch('settings/update', { injector: { css: url } }));
    }

    updateSSO(data: SSOSettingsRequest) {
        return RequestService.post('/settings/sso', data)
            .then(() => dispatch('settings/update', data));
    }

    private assetToFormData(data: AssetRequest) {
        const formData = new FormData();
        if (data.asset) formData.append('asset', data.asset);
        return formData;
    }

    uploadLoginLogo(data: AssetRequest) {
        return RequestService.post('/settings/branding/login_logo', this.assetToFormData(data), {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
            .then(({ url }) => dispatch('settings/update', { branding: { login_logo: url } }));
    }

    uploadFavicon(data: AssetRequest) {
        return RequestService.post('/settings/branding/favicon', this.assetToFormData(data), {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
            .then(({ url }) => dispatch('settings/update', { branding: { favicon: url } }));
    }

    uploadLogo(data: AssetRequest) {
        return RequestService.post('/settings/branding/logo', this.assetToFormData(data), {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
            .then(({ url }) => dispatch('settings/update', { branding: { logo: url } }));
    }
}

export default new SettingsService();
