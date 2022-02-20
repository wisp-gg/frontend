<template>
    <div class="flex w-full">
        <div class="bg-primary-500 rounded-md flex-grow">
            <div class="flex items-center text-white text-opacity-50 border-primary-400 px-4 py-2">
                <!-- Have to use spans to put / in otherwise IDE puts whitespace on left/right of the / in HTMl, throwing the layout off -->

                <span>/</span>
                <span class="px-1">
                    home
                </span>
                <span>/</span>

                <span @click="navigate('/')" class="px-1 cursor-pointer text-white text-opacity-75 hover:text-opacity-100">
                    container
                </span>
                <span v-if="breadcrumbs.length">/</span>

                <v-input type="hidden" name="path" :value="path" v-if="input && !editable" />

                <template v-for="(crumb, idx) of breadcrumbs" :key="idx">
                    <v-input class="input input-slim w-1/4 ml-1 no-input-padding" name="path" label="components.form.fields.file_name" :result-prefix="path" :value="crumb.name" rule="required" hide-label v-if="crumb.editable" />

                    <span v-else @click="crumb.path && navigate(crumb.path)" class="px-1" :class="crumb.path ? ['text-white', 'text-opacity-75 hover:text-opacity-100', 'cursor-pointer'] : []">
                        {{ crumb.name }}
                    </span>

                    <span v-if="crumb.path">/</span>
                </template>
            </div>
        </div>

        <slot />
    </div>
</template>

<style>
.no-input-padding > input {
    padding: 0 !important;
}
</style>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
    props: {
        path: {
            type: String,
            required: true
        },
        editable: {
            type: Boolean,
        },
        input: {
            type: Boolean,
        },
    },

    setup(props) {
        const router = useRouter();

        return {
            breadcrumbs: computed(() => {
                const res: any[] = props.path
                    .substr(props.path.startsWith('/') ? 1 : 0)
                    .split('/')
                    .map((name, idx, dirs) => {
                        if (idx === dirs.length - 1) return {
                            name,
                        };

                        return {
                            name,
                            path: `/${dirs.slice(0, idx + 1).join('/')}`
                        };
                    });

                if (props.editable) res.push({
                    name: '',
                    editable: true,
                });

                return res;
            }),
            navigate: (path: string) => {
                router.push({
                    name: 'server.management.files.index',
                    hash: path !== '/' ? `#${path}` : undefined,
                });
            }
        };
    }
});
</script>
