\<template>
    <modal
        has-alerts
        title="server.subusers.configure_permissions"
        :opener-text="!!subuser ? 'server.subusers.configure_permissions' : 'generic.create'"
        :permission="!!subuser ? 'subuser.update' : 'subuser.create'"
        @open="onModalOpen"
    >
        <template #default="{ close }">
            <v-form :service-id="submit" :on-success="onSuccess(close)">
                <v-input class="flex-grow" name="email" rule="required" :value="email" :readonly="!!subuser">
                    <v-submit class="ml-5" no-margin color="primary" :label="!!subuser ? 'server.subusers.update_subuser' : 'server.subusers.add_new_subuser'" :permission="!!subuser ? 'subuser.update' : 'subuser.create'" />
                </v-input>


                <!--                <v-switch-->
                <!--                    name="all_permissions"-->
                <!--                    :value="Object.values(permissions).flat().every(p => selectedPermissions.includes(p))"-->
                <!--                    @change="onAllPermissionsToggled"-->
                <!--                />-->

                <div class="flex flex-col gap-y-4">
                    <accordion
                        v-for="[name, groupPermissions] in Object.entries(permissions)"
                        :key="name"
                        :name="`permissions.${name}.title`"
                        always-open
                    >
                        <template #extra>
                            <input
                                type="checkbox"
                                class="input !w-5 !h-5"
                                :disabled="groupPermissions.filter(a => a.assignable).length === 0"

                                :checked="groupPermissions.filter(a => a.assignable).every(r => selectedPermissions.includes(r.name))"
                                @click.stop="onGroupToggled(groupPermissions)"
                            >
                        </template>

                        <p class="text-white/25 mb-4">
                            <t :path="`permissions.${name}.description`" />
                        </p>

                        <div
                            v-for="permission in groupPermissions"
                            class="flex items-center px-4 py-2 rounded"
                            :class="permission.assignable ? ['hover:bg-primary-500'] : ['opacity-50 cursor-not-allowed']"
                            @click="onCheckboxRowClicked($event, permission)"
                        >
                            <input
                                class="input"
                                type="checkbox"
                                :disabled="!permission.assignable"

                                :checked="selectedPermissions.includes(permission.name)"
                                @click.stop="onPermissionToggled(permission)"
                            >
                            <div class="ml-4">
                                <h2>
                                    <t :path="`permissions.${permission.name.replace(/:/g, '.')}.title`" />
                                </h2>

                                <p class="text-sm text-white/25">
                                    <t :path="`permissions.${permission.name.replace(/:/g, '.')}.description`" />
                                </p>
                            </div>
                        </div>
                    </accordion>
                </div>
            </v-form>
        </template>
    </modal>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { dispatch } from '~/core';
import { ServerPermissions } from '~/api/services/client/subusers';
import { ServerSubuser } from '~/api/models';
import { useService, refreshList } from '~/plugins';

export default defineComponent({
    props: {
        subuser: {
            type: ServerSubuser
        }
    },

    setup(props) {
        const email = ref<string>(props.subuser?.user.email ?? '');

        const permissions = ref<ServerPermissions>({
            assignable: [],
            permissions: [],
        });
        const selectedPermissions = ref<string[]>([...(props.subuser?.permissions ?? [])]);

        const togglePermission = (permission: Record<string, string>) => {
            if (selectedPermissions.value.includes(permission.name)) {
                selectedPermissions.value = selectedPermissions.value.filter(r => r !== permission.name);
            } else {
                selectedPermissions.value.push(permission.name);
            }
        };

        return {
            onSuccess: (close: () => void) => {
                return () => {
                    close();

                    refreshList('subusers@getAll')
                        .then(() => {
                            if (!props.subuser) {
                                dispatch('alerts/add', {
                                    type: 'success',
                                    title: ['server.subusers.subuser_added'],
                                });
                            }
                        });
                };
            },
            updateList: () => dispatch('lists/refresh', 'subusers@getAll'),

            email,
            selectedPermissions,
            permissions: computed(() => {
                const groups: string[] = permissions.value
                    .permissions
                    .filter(a => a !== 'websocket.read') // Always allowed internally
                    .map(a => a.split('.')[0])
                    .filter((a, idx, arr) => arr.indexOf(a) === idx);

                return groups.reduce((obj, groupName: string) => ({
                    ...obj,
                    [groupName.replace(/:/g, '.')]: permissions.value.permissions.filter(a => a.startsWith(`${groupName}.`))
                        .map(p => ({
                            name: p,
                            assignable: permissions.value.assignable.includes(p)
                        })),
                }), {});
            }),

            // Lifecycle events
            onModalOpen: () => {
                useService<ServerPermissions>('subusers@permissions', {
                    displayErrorsInUI: 'server.subusers.configure_permissions',
                    background: true,
                }).then(res => {
                    permissions.value = res;
                });
            },

            submit: (data: Record<string, any>) => {
                return useService(props.subuser ? 'subusers@update' : 'subusers@create', {
                    displayErrorsInUI: 'server.subusers.configure_permissions',
                }, {
                    ...(props.subuser ? { id: props.subuser.id } : {}),
                    email: data.email,
                    permissions: selectedPermissions.value
                });
            },

            // Permission selection events
            onAllPermissionsToggled: (checked: boolean) => {
                if (checked) {
                    selectedPermissions.value = Object.values(permissions.value).flat();
                } else {
                    selectedPermissions.value = [];
                }
            },

            onGroupToggled: (permissions: Record<string, any>[]) => {
                const alreadySelected = permissions.every(r => selectedPermissions.value.includes(r.name));

                if (alreadySelected) {
                    selectedPermissions.value = selectedPermissions.value.filter(r => !permissions.find(p => p.name === r));
                } else {
                    selectedPermissions.value = [...selectedPermissions.value.filter(r => !permissions.find(p => p.name === r)), ...permissions.map(r => r.name)];
                }
            },

            onCheckboxRowClicked: ({ target }: { target: HTMLInputElement }, permission: Record<string, any>) => {
                if (target.tagName === 'INPUT') return;

                togglePermission(permission);
            },

            onPermissionToggled: togglePermission,
        };
    },
});
</script>
