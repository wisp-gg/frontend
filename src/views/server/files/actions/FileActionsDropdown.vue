<template>
    <popper placement="bottom">
        <v-button color="secondary">
            <fa :icon="['fas', 'ellipsis-h']" />
        </v-button>

        <template #content>
            <ul class="bg-primary-300 mt-2 rounded border border-white/25">
                <li>
                    <rename-button :root="path" :name="file.name" />
                </li>

                <li v-if="file.isFile">
                    <v-button color="secondary" class="flex items-center p-4 text-sm w-full rounded-none" :permission="['file.read', 'file.write']" @click="copyFile(file.name)">
                        <fa class="mr-2" :icon="['fas', 'copy']" size="lg" fixed-width />
                        <t path="server.files.copy" />
                    </v-button>
                </li>

                <li v-if="!file.isArchive">
                    <v-button color="secondary" class="flex items-center p-4 text-sm w-full rounded-none" :permission="['file.archive', 'file.read']" @click="compressFile(file.name)">
                        <fa class="mr-2" :icon="['fas', 'file-archive']" size="lg" fixed-width />
                        <t path="server.files.compress" />
                    </v-button>
                </li>

                <li v-if="file.isArchive">
                    <v-button color="secondary" class="flex items-center p-4 text-sm w-full rounded-none" :permission="['file.read', 'file.write']" @click="decompressFile(file.name)">
                        <fa class="mr-2" :icon="['fas', 'file-archive']" size="lg" fixed-width />
                        <t path="server.files.decompress" />
                    </v-button>
                </li>

                <li v-if="file.isFile">
                    <v-button color="secondary" class="flex items-center p-4 text-sm w-full rounded-none" permission="file.read" @click="downloadFile(file.name)">
                        <fa class="mr-2" :icon="['fas', 'download']" size="lg" fixed-width />
                        <t path="server.files.download" />
                    </v-button>
                </li>

                <li>
                    <!-- TODO: this should be prompted -->
                    <v-button color="danger" class="flex items-center p-4 text-sm w-full rounded-t-none" permission="file.delete" @click="deleteFile(file.name)">
                        <fa class="mr-2" :icon="['fas', 'trash']" size="lg" fixed-width />
                        <t path="generic.delete" />
                    </v-button>
                </li>
            </ul>
        </template>
    </popper>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import Popper from 'vue3-popper';
import { dispatch } from '~/core';
import { File } from '~/api/models';
import { DownloadFileResponse } from '~/api/services/client/files';
import { useService } from '~/plugins';
import RenameButton from './RenameButton.vue';

export default defineComponent({
    components: { Popper, RenameButton },
    props: {
        path: {
            type: String,
            required: true,
        },
        file: {
            type: File,
            required: true,
        },
    },

    setup(props) {
        const updateList = () => dispatch('lists/refresh', 'files@getDirectory');

        return {
            formattedPath: computed(() => props.path === '/' ? '/' : `${props.path}/`),
            copyFile: (path: string) => {
                useService('files@copyFile', true, { root: props.path, file: path })
                    .then(() => updateList());
            },
            compressFile: (path: string) => {
                useService('files@compressFile', true, { root: props.path, files: [path] })
                    .then(() => updateList());
            },
            decompressFile: (path: string) => {
                useService('files@decompressFile', true, { root: props.path, file: path })
                    .then(() => updateList());
            },
            downloadFile: (path: string) => {
                useService<DownloadFileResponse>('files@downloadFile', true, { path })
                    .then(({ url }) => window.open(url));
            },
            deleteFile: (path: string) => {
                useService('files@deleteFile', true, { root: props.path, files: [path] })
                    .then(() => updateList());
            },
        };
    }
});
</script>
