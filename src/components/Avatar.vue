<template>
    <img v-if="avatarURL" class="outline-none" alt="user image" :src="avatarURL">
    <div v-else class="skeleton outline-none" />
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { md5 } from 'hash-wasm';

export default defineComponent({
    props: {
        email: {
            type: String,
            required: true,
        },
    },

    setup(props) {
        const avatarURL = ref<null | string>(null);

        const setAvatarURL = (email: string) =>
            md5(props.email)
                .then(hash => {
                    avatarURL.value = `https://www.gravatar.com/avatar/${hash}?s=160`;
                });

        setAvatarURL(props.email);
        watch(() => props.email, value => setAvatarURL(value));

        return {
            avatarURL,
        };
    },
});
</script>
