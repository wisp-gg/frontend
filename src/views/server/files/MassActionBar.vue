<template>
    <div class="pointer-events-none fixed bottom-0 z-20 left-0 right-0 flex justify-center" :class="usingSidebar ? ['md:ml-64'] : []">
        <div class="btn-group justify-center pointer-events-auto rounded-lg p-4 mb-6 bg-primary-800">
            <v-button color="warning" :permission="['file.archive', 'file.read']" @click="compressFiles" spinner>
                <t path="server.files.compress" />
            </v-button>

            <modal v-slot="{ close }" title="server.files.delete_files" permission="file.delete" opener-color="danger" opener-text="generic.delete">
                <h2 class="text-lg">
                    <t path="server.files.delete_following" />
                </h2>

                <ul class="list-disc ml-4">
                    <li v-for="(file, idx) in files" :key="idx">
                        {{ file.name }}
                    </li>
                </ul>

                <div class="text-right">
                    <v-button color="danger" @click="deleteFiles().then(close)" spinner>
                        <t path="generic.submit" />
                    </v-button>
                </div>
            </modal>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { state, dispatch } from '~/core';
import { File } from '~/api/models';
import { NavBarPosition } from '~/api/models/User';
import { useService } from '~/plugins';

export default defineComponent({
    props: {
        path: {
            type: String,
            required: true,
        },
        files: {
            type: Array as () => File[],
            required: true,
        }
    },

    setup(props) {
        const updateList = () => dispatch('lists/refresh', 'files@getDirectory');

        return {
            usingSidebar: computed(() => (state.user.data?.preferences?.navbarPosition ?? NavBarPosition.LEFT) === NavBarPosition.LEFT),

            compressFiles: () => {
                return useService('files@compressFile', true, {
                    root: props.path,
                    files: props.files.map(f => f.name),
                }).then(updateList);
            },

            deleteFiles: () => {
                return useService('files@deleteFile', true, {
                    root: props.path,
                    files: props.files.map(f => f.name),
                }).then(updateList);
            },
        };
    }
});
</script>
