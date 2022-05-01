<template>
    <v-form service-id="files@writeFile" :on-success="onSuccess" global>
        <div class="mb-4">
            <file-breadcrumbs :editable="isNewFile" :path="path" class="flex-grow" input />
        </div>

        <container no-padding title="server.files.file_contents">
            <template #actions>
                <!-- TODO: allow switching modes - requires <v-select> to support non-form parent -->
            </template>

            <!-- TODO: how does one skeleton the editor...? -->
            <skeleton :content="8" when="files@readFile">
                <v-editor name="content" :path="path" :value="content" @modes="modes = $event" />
            </skeleton>
        </container>

        <div class="text-right pt-4">
            <v-button color="secondary" class="mr-3" :to="{name: 'server.management.files.index', hash: `#${returnPath}${returnPath === '' ? '/' : ''}`}">
                <t path="server.files.return_to_file_manager" />
            </v-button>
            <v-submit color="primary" permission="file.write">
                <t path="server.files.save_file" />
            </v-submit>
        </div>
    </v-form>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { dispatch } from '~/core';
import { useService } from '~/plugins';
import { FileContents } from '~/api/services/client/files';
import FileBreadcrumbs from './FileBreadcrumbs.vue';

export default defineComponent({
    components: { FileBreadcrumbs },
    setup() {
        const router = useRouter();
        const currentRoute = useRoute();

        const isNewFile = currentRoute.name?.toString().endsWith('.new');
        if (!isNewFile) {
            // TODO: prevent direct visit of /files/* without valid hash (not empty, doesn't end with /)
        }

        watch(() => currentRoute.hash, newValue => handlePath(newValue));

        const path = ref('/');

        const handlePath = (rawHash: string) => {
            path.value = rawHash.slice(1) || '/';

            if (path.value !== '/') { // Useless to put #/ in url when it's already default
                router.replace({
                    hash: `#${path.value}`,
                });
            }
        };
        handlePath(currentRoute.hash);

        const modes = ref([]);

        const content = ref('');
        if (!isNewFile) {
            useService<FileContents>('files@readFile', true, {
                path: path.value,
            }).then(res => {
                content.value = res.content;
            });
        }

        return {
            path,
            modes,
            content,
            isNewFile,
            returnPath: computed(() => {
                const folderPath = path.value.split('/');
                folderPath.pop();

                return folderPath.join('/');
            }),

            onSuccess: (data: Record<string, any>) => {
                dispatch('alerts/add', {
                    type: 'success',
                    title: ['server.files.file_saved'],
                });

                if (isNewFile) {
                    router.push({
                        name: 'server.management.files.edit',
                        hash: `#${path.value}`,
                    });
                }
            },
        };
    },
});
</script>
