<template>
    <div class="flex mt-2">
        <!-- TODO: Component for this? Since its also used in audit logs -->
        <div class="lg:w-1/2 border border-white/10 rounded-lg mt-4 overflow-hidden">
            <div class="bg-primary-300 p-4 text-white rounded-t-lg">
                <t path="admin.index.license_information" />
            </div>

            <div>
                <table class="w-full">
                    <tr class="odd:bg-primary-500 even:bg-primary-300">
                        <td class="p-4">
                            <t path="components.table.labels.plan" />
                        </td>
                        <td class="p-4">
                            <skeleton :content="16">
                                {{ license?.plan }}
                            </skeleton>
                        </td>
                    </tr>

                    <tr class="odd:bg-primary-500 even:bg-primary-300">
                        <td class="p-4">
                            <t path="components.table.labels.domain" />
                        </td>
                        <td class="p-4">
                            <skeleton :content="12">
                                {{ license?.fqdn }}
                            </skeleton>
                        </td>
                    </tr>

                    <tr class="odd:bg-primary-500 even:bg-primary-300">
                        <td class="p-4">
                            <t path="components.table.labels.licensed_to" />
                        </td>
                        <td class="p-4">
                            <skeleton :content="12">
                                {{ license?.nameFirst }} {{ license?.nameLast }}
                            </skeleton>
                        </td>
                    </tr>

                    <tr class="odd:bg-primary-500 even:bg-primary-300">
                        <td class="p-4">
                            <t path="components.table.labels.expires" />
                        </td>
                        <td class="p-4">
                            <skeleton :content="16">
                                <date v-if="license?.expiresAt" :timestamp="license?.expiresAt" />
                                <t v-else path="generic.never" />
                            </skeleton>
                        </td>
                    </tr>

                    <tr class="odd:bg-primary-500 even:bg-primary-300">
                        <td class="p-4">
                            <t path="components.table.labels.addons" />
                        </td>
                        <td class="p-4">
                            <skeleton :content="8">
                                <t v-if="!license?.addons.length" path="generic.none" />

                                <ul v-else class="inline list-none">
                                    <li v-for="addon of license?.addons" :key="addon" class="inline">
                                        {{ addon }}
                                    </li>
                                </ul>
                            </skeleton>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { License } from '~/api/models';
import { useService } from '~/plugins';

export default defineComponent({
    setup(props, context) {
        const license = ref<License | null>(null);

        useService<License>('overview@license', true)
            .then(data => license.value = data);

        return {
            license,
        };
    }
});
</script>
