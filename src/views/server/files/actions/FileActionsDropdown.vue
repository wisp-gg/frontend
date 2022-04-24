<template>
    <popper placement="bottom">
        <v-button color="secondary">
            <fa :icon="['fas', 'ellipsis-h']" />
        </v-button>

        <template #content>
            <ul class="bg-primary-300 mt-2 rounded border border-white/25">
                <li>
                    <rename-button :path="formattedPath + file.name" :name="file.name" />
                </li>

                <li v-if="file.isFile">
                    <v-button color="secondary" class="flex items-center p-4 text-sm w-full rounded-none" :permission="['file.read', 'file.write']" @click="copyFile(formattedPath + file.name)">
                        <fa class="mr-2" :icon="['fas', 'copy']" size="lg" fixed-width />
                        <t path="server.files.copy" />
                    </v-button>
                </li>

                <li v-if="!file.isArchive">
                    <v-button color="secondary" class="flex items-center p-4 text-sm w-full rounded-none" :permission="['file.archive', 'file.read']" @click="compressFile(formattedPath + file.name, path)">
                        <fa class="mr-2" :icon="['fas', 'file-archive']" size="lg" fixed-width />
                        <t path="server.files.compress" />
                    </v-button>
                </li>

                <li v-if="file.isArchive">
                    <v-button color="secondary" class="flex items-center p-4 text-sm w-full rounded-none" :permission="['file.read', 'file.write']" @click="decompressFile(formattedPath + file.name)">
                        <fa class="mr-2" :icon="['fas', 'file-archive']" size="lg" fixed-width />
                        <t path="server.files.decompress" />
                    </v-button>
                </li>

                <li v-if="file.isFile">
                    <v-button color="secondary" class="flex items-center p-4 text-sm w-full rounded-none" permission="file.read" @click="downloadFile(formattedPath + file.name)">
                        <fa class="mr-2" :icon="['fas', 'download']" size="lg" fixed-width />
                        <t path="server.files.download" />
                    </v-button>
                </li>

                <li>
                    <!-- TODO: this should be prompted -->
                    <v-button color="danger" class="flex items-center p-4 text-sm w-full rounded-t-none" permission="file.delete" @click="deleteFile(formattedPath + file.name)">
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
import state from '~/state';
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
        const updateList = () => state.lists.refresh('files@getDirectory');

        return {
            formattedPath: computed(() => props.path === '/' ? '/' : `${props.path}/`),
            copyFile: (path: string) => {
                useService('files@copyFile', true, { path })
                    .then(() => updateList());
            },
            compressFile: (path: string, to: string) => {
                useService('files@compressFile', true, { paths: [path], to, })
                    .then(() => updateList());
            },
            decompressFile: (path: string) => {
                useService('files@decompressFile', true, { path })
                    .then(() => updateList());
            },
            downloadFile: (path: string) => {
                useService<DownloadFileResponse>('files@downloadFile', true, { path })
                    .then(({ url }) => window.open(url));
            },
            deleteFile: (path: string) => {
                useService('files@deleteFile', true, { paths: [path] })
                    .then(() => updateList());
            },
        };
    }
});
</script>
