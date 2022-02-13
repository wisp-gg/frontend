<template>
    <modal v-slot="{ close }" title="client.security.2fa_modal_header" opener-color="success" opener-text="client.security.enable_2fa" @update:modelValue="onModalChange">
        <v-form service-id="security@enable2Fa">
            <div class="flex flex-col lg:flex-row">
                <skeleton :content="8">
                    <div class="flex items-center">
                        <vue-qrcode :color="{ dark: '#000', light: '#FFF' }" type="image/webp" :quality="1" :value="totpUrl" class="w-48 h-48 !max-w-[none]" />
                    </div>
                </skeleton>
                <div class="flex flex-col mt-4 lg:mt-0 lg:ml-8">
                    <p class="flex-grow text-white text-opacity-75">
                        <t path="client.security.2fa_notice" />
                    </p>

                    <label class="text-white opacity-50 tracking-wide uppercase block my-3" for="secret">
                        <t path="client.security.2fa_secret" />
                    </label>
                    <skeleton :content="32">
                        <input class="input flex-grow mb-8 cursor-pointer" id="secret" v-clipboard="totpData?.secret" :value="totpData?.secret" readonly>
                    </skeleton>

                    <v-input name="token" rule="required" />
                </div>
            </div>

            <div class="text-right space-x-4">
                <v-button color="danger" class="px-6 py-2" @click="close">
                    <t path="generic.cancel" />
                </v-button>
                <v-submit color="primary" label="generic.submit" />
            </div>
        </v-form>
    </modal>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import VueQrcode from 'vue-qrcode';
import { useService } from '~/plugins';
import { Generate2FaData } from '~/api/services/client/security';

export default defineComponent({
    components: { VueQrcode },

    setup() {
        const totpData = ref<Generate2FaData | undefined>();

        return {
            totpData,
            totpUrl: computed(() => `otpauth://totp/${totpData.value?.issuer}:${totpData.value?.email}?secret=${totpData.value?.secret}&issuer=${totpData.value?.issuer}`),
            onModalChange: (state: boolean) => {
                if (!state || totpData.value) return;

                useService<Generate2FaData>('security@get2Fa', true)
                    .then(data => totpData.value = data);
            },
        };
    }
});
</script>
