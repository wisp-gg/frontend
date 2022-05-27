<template>
    <div>
        <div class="flex flex-col md:flex-row mb-4">
            <file-breadcrumbs :path="path">
                <popper placement="bottom">
                    <v-button class="ml-2" color="secondary">
                        <fa :icon="['fas', 'ellipsis-h']" />
                    </v-button>

                    <template #content>
                        <ul class="bg-primary-300 mt-2 mr-4 rounded border border-white/25">
                            <li>
                                <v-button color="secondary" permission="file.write" :to="{name: 'server.management.files.new', hash: `#${path}${path.endsWith('/') ? '' : '/'}`}" class="flex items-center p-4 text-sm w-full rounded-none">
                                    <fa class="mr-2" :icon="['fas', 'file-alt']" size="lg" fixed-width />
                                    <t path="server.files.new_file" />
                                </v-button>
                            </li>
                            <li>
                                <create-folder-modal :path="path" />
                            </li>
                            <li>
                                <v-button color="secondary" permission="file.write" class="flex items-center p-4 text-sm w-full rounded-none" @click="uploadPrompt(path)">
                                    <fa class="mr-2" :icon="['fas', 'upload']" size="lg" fixed-width />
                                    <t path="server.files.upload" />
                                </v-button>
                            </li>
                            <li>
                                <file-search-modal />
                            </li>
                            <li class="border-t border-opacity-20">
                                <git-clone-modal :path="path" />
                            </li>
                            <li>
                                <git-pull-modal :path="path" />
                            </li>
                            <can feature="workshop-dl">
                                <li class="border-t border-opacity-20">
                                    <steam-workshop-modal :path="path" />
                                </li>
                            </can>
                        </ul>
                    </template>
                </popper>
            </file-breadcrumbs>
        </div>

        <div :class="dragging ? ['drag-files'] : []" ref="fileList">
            <list
                service-id="files@getDirectory"
                :data="path"
                :per-page="100"
                :skeletons="5"
                :fields="listFields"
                ref="listElement"
                checkbox
                class="files"

                @result-context-menu="onContextMenu"
            >
                <template #headers-after>
                    <th />
                </template>

                <template #items-before>
                    <!-- TODO: not big fan of the duplicate code this part requires (though mostly items-before slot logic having to have same style/widths) :/ -->
                    <tr class="bg-primary-500" v-if="path.split('/').length > 2 && path !== '/'">
                        <td class="p-6 td-min">
                            <fa :icon="['fas', 'folder']" size="lg" fixed-width />
                        </td>
                        <td class="p-6 w-1/2" colspan="4">
                            <v-button class="text-white text-opacity-50 hover:text-opacity-80" @click="navigateDirectory('/')">
                                ←
                            </v-button>
                        </td>
                    </tr>
                    <tr class="bg-primary-500" v-if="path !== '/'">
                        <td class="p-6 td-min">
                            <fa :icon="['fas', 'folder']" size="lg" fixed-width />
                        </td>
                        <td class="p-6 w-1/2" colspan="4">
                            <v-button class="text-white text-opacity-50 hover:text-opacity-80" @click="navigateDirectory('..')">
                                ← {{ getPreviousDirectory() }}
                            </v-button>
                        </td>
                    </tr>

                    <template v-for="(file, identifier) in pendingFiles" :key="identifier">
                        <tr class="bg-primary-500">
                            <td class="p-6 td-min" />
                            <td class="p-6 w-1/2" colspan="4">
                                {{ file.name }}
                                <template v-if="file.files">
                                    ({{ file.uploaded_files }} / {{ file.files }})
                                </template>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="20" class="bg-accent-200/75 w-full">
                                <div :style="`width:${Math.round(file.uploaded_size / file.size * 100)}%`" class="overflow-hidden h-2 transition transition-transform ease-in-out shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-info m-[-1px]" />
                            </td>
                        </tr>
                    </template>
                </template>

                <template #field-name="{ result }">
                    <template v-if="result.isDirectory">
                        <v-button class="text-white text-opacity-50 group-hover:text-opacity-100" @click="navigateDirectory(result.name)">
                            {{ result.name }}
                        </v-button>
                    </template>
                    <template v-else>
                        <v-button :to="{name: 'server.management.files.edit', hash: `#${path}${path.endsWith('/') ? '' : '/'}${result.name}`}" v-if="result.isReadable" permission="file.read" class="text-white text-opacity-50 group-hover:text-opacity-100">
                            {{ result.name }}
                        </v-button>
                        <template v-else>
                            {{ result.name }}
                        </template>
                    </template>
                </template>

                <template #field-size="{ result }">
                    <td>
                        <template v-if="result.isFile">
                            {{ result.readableSize[0] }} <t :path="`generic.units.${result.readableSize[1]}`" />
                        </template>
                    </td>
                </template>

                <template #field-checkbox="{ result }">
                    <fa class="text-accent-500 ml-3" :icon="['fas', result.icon]" size="lg" fixed-width />
                </template>

                <template #fields-after="{ result }">
                    <td class="p-4 w-[10%]">
                        <skeleton :content="4">
                            <file-actions-dropdown :path="path" :file="result" />
                        </skeleton>
                    </td>
                </template>

                <template #items-after>
                    <mass-action-bar v-if="checkedItems.length > 0" :files="checkedItems" />
                </template>
            </list>
        </div>
    </div>
</template>

<style>
    .drag-files {
        border: 2px dashed #0087F7;
        border-top: 0 !important;
        border-radius: 5px;
        margin: 0;
        opacity: 0.5;
    }

    .drag-files * {
        pointer-events: none !important;
    }
</style>

<script lang="ts">
import { defineComponent, onMounted, ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Popper from 'vue3-popper';
import { Logger, state, dispatch } from '~/core';
import { supportsDragAndDrop } from '~/plugins';
import { isAvailable, pendingFiles, handleUploadEvent, uploadPrompt, setOnAllUploadsFinishCallback } from '~/plugins/upload';
import FileBreadcrumbs from './FileBreadcrumbs.vue';
import { CreateFolderModal, GitCloneModal, GitPullModal, FileSearchModal, FileActionsDropdown, SteamWorkshopModal, RenameButton } from './actions';
import MassActionBar from '~/views/server/files/MassActionBar.vue';

export default defineComponent({
    components: { Popper, MassActionBar, FileBreadcrumbs, CreateFolderModal, GitCloneModal, GitPullModal, FileSearchModal, FileActionsDropdown, SteamWorkshopModal, RenameButton },
    setup() {
        const router = useRouter();
        const currentRoute = useRoute();
        const { d } = useI18n();

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

        const getPreviousDirectory = () => {
            const newPath = path.value.split('/');
            newPath.pop();

            return newPath.join('/');
        };

        const fileList = ref<HTMLElement | undefined>();
        const dragging = ref(false);

        onMounted(() => {
            if (!fileList.value) throw new Error('Unable to initialize file list - file list element is missing???');

            if (supportsDragAndDrop()) {
                Logger.debug('Files', 'Detected drag and drop support in this browser.');

                ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].forEach(evt => {
                    fileList.value?.addEventListener(evt, e => {
                        e.preventDefault();
                        e.stopPropagation();
                    });
                });

                // Chrome seems to spam dragenter and dragleave events, so to avoid flickering rely on a delay.
                let dragStopper: undefined | ReturnType<typeof setTimeout>;
                ['dragover', 'dragenter'].forEach(evt => {
                    fileList.value?.addEventListener(evt, () => {
                        if (dragStopper) {
                            clearTimeout(dragStopper);
                            dragStopper = undefined;
                        }

                        dragging.value = true;
                    });
                });

                ['dragleave', 'dragend', 'drop'].forEach(evt => {
                    fileList.value?.addEventListener(evt, () => {
                        if (dragStopper) clearTimeout(dragStopper);
                        dragStopper = setTimeout(() => {
                            if (dragStopper) {
                                clearTimeout(dragStopper);
                                dragStopper = undefined;
                            }

                            dragging.value = false;
                        }, 100);
                    });
                });

                fileList.value?.addEventListener('drop', e => {
                    if (!e.dataTransfer) return;

                    if (isAvailable()) {
                        handleUploadEvent(e, path.value);
                    } else {
                        dispatch('alerts/add', {
                            type: 'danger',
                            title: ['server.files.upload_unavailable'],
                        });
                    }
                });
            } else {
                Logger.warn('Files', 'Drag and drop functionality is not supported in this browser.');
            }
        });

        const listElement = ref<any | undefined>();
        setOnAllUploadsFinishCallback(() => {
            dispatch('lists/refresh', 'files@getDirectory');
        });

        return {
            d,
            path,
            fileList,
            dragging,
            checkedItems: computed(() => state.lists.data['files@getDirectory']?.checked),
            pendingFiles,
            listElement,
            listFields: <ListField[]>[
                { label: 'file_name', key: 'name', skeleton: 16, style: 'width: 50%' },
                { label: 'size', key: 'size', skeleton: 4, style: 'width: auto' },
                { label: 'last_modified', key: 'modifiedAt', format: 'datetime', skeleton: 16, style: 'width: auto' },
            ],

            onContextMenu: (evt: MouseEvent, result: any) => {
                evt.preventDefault();
                // TODO: Somehow dynamically create below element at evt.clientX / evt.clientY (vue3-popper needs a way to override x / y placement instead of opener ig?)
                // <file-actions-dropdown :path="path" :file="result" />

                return false;
            },

            getPreviousDirectory,
            navigateDirectory: (directory: string) => {
                if (directory === '..') {
                    path.value = getPreviousDirectory();
                } else if (directory === '/') {
                    path.value = '/';
                } else {
                    path.value = `${path.value}${path.value.endsWith('/') ? '' : '/'}${directory}`;
                }
                if (path.value === '') path.value = '/';

                router.push({
                    hash: path.value !== '/' ? `#${path.value}` : undefined,
                });
            },

            uploadPrompt,
        };
    },
});
</script>
