<template>
    <v-form :service-id="creating ? 'users@create' : 'users@update'" :on-success="onSuccess" class="grid grid-cols-1 lg:grid-cols-2 items-start gap-x-4 gap-y-4">
        <div class="space-y-4">
            <container title="admin.users.identity">
                <v-input name="email" :value="user?.email" rule="required" />

                <div class="flex flex-col xl:flex-row gap-x-6">
                    <v-input class="flex-grow" name="name_first" :value="user?.nameFirst" rule="required" />
                    <v-input class="flex-grow" name="name_last" :value="user?.nameLast" rule="required" />
                </div>

                <v-input name="external_id" footer="admin.users.external_id_footer" :value="user?.externalId ?? ''" />
                <v-select name="preferences.language" prefix="generic.languages" footer="admin.users.language_footer" :value="currentLanguage" :options="languages" />
            </container>

            <container title="admin.users.password">
                <div class="mb-4" v-if="creating">
                    <alert type="info" icon="info-circle" title="admin.users.password_optional" />
                </div>

                <v-input name="password" type="password" />
            </container>
        </div>

        <div>
            <container title="generic.permissions">
                <v-switch name="root_admin" footer="admin.users.root_admin_footer" :value="user?.rootAdmin" />
                <v-switch name="support_op" footer="admin.users.support_op_footer" :value="user?.supportOp" />
                <v-switch name="support_op_bypass" footer="admin.users.support_op_bypass_footer" :value="user?.supportOpBypass" />

                <div class="pt-8" v-if="!creating">
                    <v-switch name="ignore_connection_error" label="admin.users.ignore_exceptions" footer="admin.users.ignore_exceptions_footer" />
                </div>
            </container>

            <div class="flex bg-primary-500 p-4 mt-4 rounded justify-between">
                <div>
                    <skeleton :content="8">
                        <disable2fa-modal v-if="user?.has2FAEnabled()" />
                    </skeleton>
                </div>

                <div class="flex gap-x-4">
                    <skeleton :content="4">
                        <delete-user-modal v-if="user" :user="user" />
                    </skeleton>

                    <v-submit color="primary" :permission="creating ? 'user.create' : 'user.update'">
                        <t :path="creating ? 'generic.create' : 'generic.save'" />
                    </v-submit>
                </div>
            </div>
        </div>
    </v-form>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getAvailableLanguages, state } from '~/core';
import { User } from '~/api/models';
import DeleteUserModal from '../DeleteUserModal.vue';
import Disable2faModal from "~/views/admin/users/manage/Disable2faModal.vue";

export default defineComponent({
    components: {
        Disable2faModal,
        DeleteUserModal,
    },

    setup(props, context) {
        const router = useRouter();
        const route = useRoute();
        const creating = computed(() => route.name === 'admin.management.users.new');

        return {
            creating,
            user: computed(() => state.models.user),
            languages: computed(() => getAvailableLanguages()), // TODO: these should be sorted by alphabet in their respective lang (or don't be translated at all...?)
            currentLanguage: computed(() => state.models.user?.preferences?.language),

            onSuccess: (user: User) => {
                if (creating.value) router.push({
                    name: 'admin.management.users.manage.about',
                    params: {
                        user: user.id,
                    }
                });
            }
        };
    },
});
</script>
