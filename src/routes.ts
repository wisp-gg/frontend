import { RouteRecordRaw } from 'vue-router';
import { Router, state } from '~/core';
import { Admin, Authenticated, Guest, Permission, Feature, TOTP, ModelBindings } from '~/middlewares';
import { GenericLayout, PopupLayout, Passthrough, TabberPassthrough } from '~/views';
import { NotFoundView } from '~/views/errors';

declare module 'vue-router' {
    interface RouteMeta {
        // Parent routes
        middlewares?: Middleware[] | [Middleware, number][],
        showChildrenInNavbar?: boolean,

        // Children routes in NavBar
        showAsCategory?: boolean;
        icon?: string; // Used for vertical NavBar only
        permission?: string;
        feature?: string;
        hidden?: boolean;
        adminOnly?: boolean;
    }
}

export const globalMiddlewares: PrioritizationMiddleware = [
    [Feature, -9],
    [Permission, -10],
];
export const routes: RouteRecordRaw[] = [
    {
        path: '/login',
        component: () => import('~/views/login/Layout.vue'),
        meta: {
            middlewares: [Guest],
        },
        children: [
            {
                name: 'login.index',
                path: '',
                component: () => import('~/views/login/Login.vue'),
            },
            {
                name: 'login.totp',
                path: 'totp',
                component: () => import('~/views/login/TOTP.vue'),
            },
            {
                name: 'login.reset_password',
                path: 'reset',
                component: () => import('~/views/login/ResetPassword.vue'),
            },
            {
                name: 'login.reset_password.token',
                path: 'reset/:token',
                component: () => import('~/views/login/ResetPasswordToken.vue'),
            },
        ],
    },
    { // Backwards compatability with v1
        name: 'login.sso',
        path: '/auth/login/sso',
        meta: {
            middlewares: [Guest],
            hidden: true,
        },
        redirect: to => {
            return {
                name: 'login.index',
                query: to.query,
            };
        },
    },
    {
        path: '/',
        component: GenericLayout,
        meta: {
            middlewares: [Authenticated, TOTP, new ModelBindings('client')],
            showChildrenInNavbar: true,
        },
        children: [
            {
                name: 'index',
                path: '',
                component: () => import('~/views/Index.vue'),
                meta: {
                    icon: 'server',
                },
            },
            {
                name: 'account.settings',
                path: 'account',
                component: () => import('~/views/account/Index.vue'),
                meta: {
                    icon: 'user',
                },
            },
            { // Redirect for backwards compatability with v1
                name: 'account.sso',
                path: 'account/sso',
                meta: {
                    hidden: true,
                },
                redirect: to => {
                    return {
                        name: 'account.settings',
                        query: to.query,
                    };
                },
            },
            {
                name: 'account.security',
                path: 'account/security',
                component: () => import('~/views/account/Security.vue'),
                meta: {
                    icon: 'lock',
                },
            },
        ],
    },
    {
        path: '/server/:server',
        component: GenericLayout,
        meta: {
            middlewares: [Authenticated, TOTP, new ModelBindings('client')],
            showChildrenInNavbar: true
        },
        children: [
            {
                name: 'server.system',
                path: '',
                component: Passthrough,
                meta: {
                    showAsCategory: true,
                },
                children: [
                    {
                        name: 'server.system.index',
                        path: '',
                        component: () => import('~/views/server/Index.vue'),
                        meta: {
                            icon: 'server',
                        },
                    },
                    {
                        name: 'server.system.details',
                        path: 'details',
                        component: () => import('~/views/server/details/Index.vue'),
                        meta: {
                            icon: 'chart-area',
                            permission: 'details.read',
                        },
                    },
                    {
                        name: 'server.system.sftp',
                        path: 'sftp',
                        component: () => import('~/views/server/sftp/Index.vue'),
                        meta: {
                            icon: 'file-upload',
                            permission: 'file.sftp',
                        },
                    },
                    {
                        name: 'server.system.audit_logs',
                        path: 'audit-logs',
                        component: () => import('~/views/server/audit-logs/Index.vue'),
                        meta: {
                            icon: 'fingerprint',
                            permission: 'audit.read',
                        }
                    },
                ]
            },

            {
                name: 'server.management',
                path: '',
                component: Passthrough,
                meta: {
                    showAsCategory: true,
                },
                children: [
                    {
                        name: 'server.management.files',
                        path: 'files',
                        component: Passthrough,
                        meta: {
                            icon: 'folder-open',
                            permission: 'file.list',
                        },
                        children: [
                            {
                                name: 'server.management.files.index',
                                path: '',
                                component: () => import('~/views/server/files/Index.vue'),
                                meta: {
                                    icon: 'folder-open',
                                    permission: 'file.list',
                                },
                            },
                            {
                                name: 'server.management.files.new',
                                path: 'new',
                                component: () => import('~/views/server/files/Manage.vue'),
                                meta: {
                                    icon: 'file-alt',
                                    permission: 'file.write',
                                },
                            },
                            {
                                name: 'server.management.files.edit',
                                path: 'edit',
                                component: () => import('~/views/server/files/Manage.vue'),
                                meta: {
                                    icon: 'file-alt',
                                    permission: 'file.write',
                                },
                            },
                        ],
                    },
                    {
                        name: 'server.management.databases',
                        path: 'databases',
                        component: () => import('~/views/server/databases/Index.vue'),
                        meta: {
                            icon: 'database',
                            permission: 'database.read',
                        }
                    },
                    {
                        name: 'server.management.backups',
                        path: 'backups',
                        component: () => import('~/views/server/backups/Index.vue'),
                        meta: {
                            icon: 'boxes',
                            permission: 'backup.read',
                        }
                    },
                    {
                        name: 'server.management.subusers',
                        path: 'subusers',
                        component: Passthrough,
                        meta: {
                            icon: 'users',
                            permission: 'subuser.read',
                        },
                        children: [
                            {
                                name: 'server.management.subusers.index',
                                path: '',
                                component: () => import('~/views/server/subusers/Index.vue'),
                                meta: {
                                    icon: 'users',
                                    permission: 'subuser.read',
                                },
                            },
                        ],
                    },
                    {
                        name: 'server.management.allocations',
                        path: 'allocations',
                        component: () => import('~/views/server/allocations/Index.vue'),
                        meta: {
                            icon: 'network-wired',
                            permission: 'allocation.read',
                        }
                    },
                ],
            },

            {
                name: 'server.configuration',
                path: '',
                component: Passthrough,
                meta: {
                    showAsCategory: true,
                },
                children: [
                    {
                        name: 'server.configuration.startup',
                        path: 'startup',
                        component: () => import('~/views/server/startup/Index.vue'),
                        meta: {
                            icon: 'cog',
                            permission: 'startup.read',
                        }
                    },
                    {
                        name: 'server.configuration.schedules',
                        path: 'schedules',
                        component: Passthrough,
                        meta: {
                            icon: 'calendar-alt',
                            permission: 'schedule.read',
                        },
                        children: [
                            {
                                name: 'server.configuration.schedules.index',
                                path: '',
                                component: () => import('~/views/server/schedules/Index.vue'),
                                meta: {
                                    icon: 'calendar-alt',
                                    permission: 'schedule.read',
                                }
                            },
                            {
                                name: 'server.configuration.schedules.manage',
                                path: ':schedule',
                                component: () => import('~/views/server/schedules/Manage.vue'),
                                meta: {
                                    icon: 'calendar-alt',
                                }
                            },
                        ]
                    },
                    {
                        name: 'server.configuration.advanced',
                        path: 'advanced',
                        component: () => import('~/views/server/advanced/Index.vue'),
                        meta: {
                            icon: 'cogs'
                        }
                    },
                ],
            },

            {
                name: 'server.tools',
                path: '',
                component: Passthrough,
                meta: {
                    showAsCategory: true,
                },
                children: [
                    {
                        name: 'server.tools.subdomains',
                        path: 'subdomains',
                        component: () => import('~/views/server/subdomains/Index.vue'),
                        meta: {
                            icon: 'cubes',
                            permission: 'subdomain.read',
                            feature: 'domain-manager',
                        }
                    },
                    {
                        name: 'server.tools.modpacks',
                        path: 'modpacks',
                        component: () => import('~/views/server/modpacks/Index.vue'),
                        meta: {
                            icon: 'cubes',
                            permission: 'modpack.read',
                            feature: 'modpack-manager',
                        }
                    },
                    {
                        name: 'server.tools.plugins',
                        path: 'plugins',
                        component: () => import('~/views/server/plugins/Index.vue'),
                        meta: {
                            icon: 'cogs',
                            permission: 'plugin.read',
                            feature: 'plugin-manager',
                        }
                    },
                    {
                        name: 'server.tools.mods',
                        path: 'mods',
                        component: () => import('~/views/server/mods/Index.vue'),
                        meta: {
                            icon: 'plug',
                            permission: 'mod.read',
                            feature: 'mod-manager',
                        }
                    },
                    {
                        name: 'server.tools.backdoor_scanner',
                        path: 'backdoor-scanner',
                        component: () => import('~/views/server/backdoor-scanner/Index.vue'),
                        meta: {
                            icon: 'door-open',
                            permission: 'scanner.update',
                            feature: 'backdoor-scanner',
                        },
                    },
                    {
                        name: 'server.tools.fastdl',
                        path: 'fastdl',
                        component: () => import('~/views/server/fastdl/Index.vue'),
                        meta: {
                            icon: 'download',
                            permission: 'fastdl.read',
                            feature: 'fastdl',
                        }
                    }
                ],
            },

            {
                name: 'server.administrate',
                path: 'administrate',
                meta: {
                    adminOnly: true,
                    permission: 'admin:server.read',
                },
                redirect: () => {
                    return {
                        name: 'admin.management.servers.manage.about',
                        params: {
                            server: state.models.server?.id,
                        },
                    };
                },
            }
        ],
    },
    {
        path: '/server/:server/console',
        component: PopupLayout,
        meta: {
            middlewares: [Authenticated, TOTP, new ModelBindings('client')],
        },
        children: [
            {
                name: 'server.console',
                path: '',
                component: () => import('~/views/server/Console.vue'),
            },
        ],
    },
    {
        path: '/admin',
        component: GenericLayout,
        meta: {
            middlewares: [Authenticated, Admin, TOTP, new ModelBindings('admin')],
            showChildrenInNavbar: true,
        },
        children: [
            // Basic Administration
            {
                name: 'admin.administration',
                path: '',
                component: Passthrough,
                meta: {
                    showAsCategory: true,
                },
                children: [
                    {
                        name: 'admin.administration.index',
                        path: '',
                        component: () => import('~/views/admin/Index.vue'),
                        meta: {
                            icon: 'home',
                        },
                    },
                    {
                        name: 'admin.administration.settings',
                        path: 'settings',
                        component: TabberPassthrough,
                        children: [
                            {
                                name: 'admin.administration.settings.general',
                                path: '',
                                component: () => import('~/views/admin/settings/General.vue'),
                                meta: {
                                    icon: 'cog'
                                }
                            },
                            {
                                name: 'admin.administration.settings.branding',
                                path: 'branding',
                                component: () => import('~/views/admin/settings/Branding.vue'),
                                meta: {
                                    icon: 'cog',
                                    feature: 'branding',
                                }
                            },
                            {
                                name: 'admin.administration.settings.embed',
                                path: 'embed',
                                component: () => import('~/views/admin/settings/Embed.vue'),
                                meta: {
                                    icon: 'cog',
                                    feature: 'opengraph',
                                }
                            },
                            {
                                name: 'admin.administration.settings.js_injector',
                                path: 'js',
                                component: () => import('~/views/admin/settings/JSInjector.vue'),
                                meta: {
                                    icon: 'cog',
                                    feature: 'js-injector',
                                }
                            },
                            {
                                name: 'admin.administration.settings.css_injector',
                                path: 'css',
                                component: () => import('~/views/admin/settings/CSSInjector.vue'),
                                meta: {
                                    icon: 'cog',
                                    feature: 'css-injector',
                                }
                            },
                            {
                                name: 'admin.administration.settings.whmcs',
                                path: 'whmcs',
                                component: () => import('~/views/admin/settings/WHMCS.vue'),
                                meta: {
                                    icon: 'cog',
                                    feature: 'whmcs-sso',
                                }
                            }
                        ]
                    },
                    {
                        name: 'admin.administration.migrator',
                        path: 'migrator',
                        component: () => import('~/views/admin/migrator/Index.vue'),
                        meta: {
                            icon: 'random',
                            permission: 'migrator.read',
                        },
                    },
                    {
                        name: 'admin.administration.announcements',
                        path: 'announcements',
                        component: () => import('~/views/admin/announcements/Index.vue'),
                        meta: {
                            icon: 'bullhorn',
                            permission: 'announcement.read',
                            feature: 'general:announcements',
                        },
                    },
                    {
                        name: 'admin.administration.application_api',
                        path: 'application-api',
                        component: Passthrough,
                        meta: {
                            permission: 'application_api.read',
                            feature: 'application-api'
                        },
                        children: [
                            {
                                name: 'admin.administration.application_api.index',
                                path: '',
                                component: () => import('~/views/admin/application-api/Index.vue'),
                                meta: {
                                    icon: 'key',
                                    permission: 'application_api.read',
                                },
                            },
                            {
                                name: 'admin.administration.application_api.new',
                                path: 'new',
                                component: () => import('~/views/admin/application-api/Manage.vue'),
                                meta: {
                                    icon: 'key',
                                    permission: 'application_api.create',
                                },
                            },
                            {
                                name: 'admin.administration.application_api.manage',
                                path: ':apiKey',
                                component: () => import('~/views/admin/application-api/Manage.vue'),
                                meta: {
                                    icon: 'key',
                                },
                            },
                        ],
                    }
                ],
            },

            // Management
            {
                name: 'admin.management',
                path: '',
                component: Passthrough,
                meta: {
                    showAsCategory: true,
                },
                children: [
                    {
                        name: 'admin.management.database_hosts',
                        path: 'databases',
                        component: Passthrough,
                        meta: {
                            permission: 'database_host.read',
                        },
                        children: [
                            {
                                name: 'admin.management.database_hosts.index',
                                path: '',
                                component: () => import('~/views/admin/database-hosts/Index.vue'),
                                meta: {
                                    icon: 'database',
                                    permission: 'database_host.read',
                                }
                            },
                            {
                                name: 'admin.management.database_hosts.manage',
                                path: ':databaseHost',
                                component: () => import('~/views/admin/database-hosts/Manage.vue'),
                                meta: {
                                    icon: 'database',
                                }
                            },
                        ]
                    },

                    {
                        name: 'admin.management.locations',
                        path: 'locations',
                        component: Passthrough,
                        meta: {
                            permission: 'location.read',
                        },
                        children: [
                            {
                                name: 'admin.management.locations.index',
                                path: '',
                                component: () => import('~/views/admin/locations/Index.vue'),
                                meta: {
                                    icon: 'globe',
                                    permission: 'location.read',
                                }
                            },
                            {
                                name: 'admin.management.locations.manage',
                                path: ':location',
                                component: () => import('~/views/admin/locations/Manage.vue'),
                                meta: {
                                    icon: 'globe'
                                }
                            },
                        ]
                    },

                    {
                        name: 'admin.management.nodes',
                        path: 'nodes',
                        component: Passthrough,
                        meta: {
                            permission: 'node.read',
                        },
                        children: [
                            {
                                name: 'admin.management.nodes.index',
                                path: '',
                                component: () => import('~/views/admin/nodes/Index.vue'),
                                meta: {
                                    icon: 'network-wired',
                                    permission: 'node.read',
                                },
                            },
                            {
                                name: 'admin.management.nodes.manage',
                                path: ':node',
                                component: TabberPassthrough,
                                children: [
                                    {
                                        name: 'admin.management.nodes.manage.about',
                                        path: '',
                                        component: () => import('~/views/admin/nodes/manage/About.vue'),
                                        meta: {
                                            icon: 'network-wired',
                                            permission: 'node.read',
                                        }
                                    },
                                    {
                                        name: 'admin.management.nodes.manage.settings',
                                        path: 'settings',
                                        component: () => import('~/views/admin/nodes/manage/Settings.vue'),
                                        meta: {
                                            icon: 'wrench',
                                            permission: 'node.read',
                                        }
                                    },
                                    {
                                        name: 'admin.management.nodes.manage.allocations',
                                        path: 'allocations',
                                        component: () => import('~/views/admin/nodes/manage/Allocations.vue'),
                                        meta: {
                                            icon: 'network-wired',
                                            permission: 'node_allocation.read',
                                        }
                                    },
                                    {
                                        name: 'admin.management.nodes.manage.servers',
                                        path: 'servers',
                                        component: () => import('~/views/admin/nodes/manage/Servers.vue'),
                                        meta: {
                                            icon: 'server',
                                            permission: 'server.read',
                                        }
                                    }
                                ]
                            },
                        ]
                    },

                    {
                        name: 'admin.management.servers',
                        path: 'servers',
                        component: Passthrough,
                        meta: {
                            permission: 'server.read',
                        },
                        children: [
                            {
                                name: 'admin.management.servers.index',
                                path: '',
                                component: () => import('~/views/admin/servers/Index.vue'),
                                meta: {
                                    icon: 'server',
                                    permission: 'server.read',
                                }
                            },
                            {
                                name: 'admin.management.servers.new',
                                path: 'new',
                                component: () => import('~/views/admin/servers/New.vue'),
                                meta: {
                                    icon: 'server',
                                    permission: 'server.create',
                                }
                            },
                            {
                                name: 'admin.management.servers.manage',
                                path: ':server',
                                component: TabberPassthrough,
                                children: [
                                    {
                                        name: 'admin.management.servers.manage.about',
                                        path: '',
                                        component: () => import('~/views/admin/servers/manage/About.vue'),
                                        meta: {
                                            icon: 'network-wired',
                                            permission: 'server.read',
                                        }
                                    },
                                    {
                                        name: 'admin.management.servers.manage.details',
                                        path: 'details',
                                        component: () => import('~/views/admin/servers/manage/Details.vue'),
                                        meta: {
                                            icon: 'network-wired',
                                            permission: 'server.read',
                                        }
                                    },
                                    {
                                        name: 'admin.management.servers.manage.build_configuration',
                                        path: 'build',
                                        component: () => import('~/views/admin/servers/manage/BuildConfiguration.vue'),
                                        meta: {
                                            icon: 'network-wired',
                                            permission: 'server.read',
                                        }
                                    },
                                    {
                                        name: 'admin.management.servers.manage.startup',
                                        path: 'startup',
                                        component: () => import('~/views/admin/servers/manage/Startup.vue'),
                                        meta: {
                                            icon: 'network-wired',
                                            permission: 'server_startup.read',
                                        }
                                    },
                                    {
                                        name: 'admin.management.servers.manage.databases',
                                        path: 'databases',
                                        component: () => import('~/views/admin/servers/manage/Databases.vue'),
                                        meta: {
                                            icon: 'network-wired',
                                            permission: 'server_database.read',
                                        }
                                    },
                                    {
                                        name: 'admin.management.servers.manage.advanced',
                                        path: 'advanced',
                                        component: () => import('~/views/admin/servers/manage/Advanced.vue'),
                                        meta: {
                                            icon: 'network-wired',
                                            permission: 'server.read',
                                        }
                                    },
                                    {
                                        name: 'admin.management.servers.manage.go_to_server',
                                        path: 'go_to_server', // TODO: rename this to something better?
                                        meta: {
                                            adminOnly: true,
                                        },
                                        redirect: () => {
                                            return {
                                                name: 'server.system.index',
                                                params: {
                                                    server: state.models.server?.uuidShort,
                                                },
                                            };
                                        },
                                    },
                                ]
                            },

                            { // Backwards compatibility with WHMCS's go go Service button
                                name: 'admin.management.servers.view',
                                path: 'view/:id',
                                meta: {
                                    hidden: true,
                                },
                                redirect: to => {
                                    return {
                                        name: 'admin.management.servers.manage.about',
                                        params: {
                                            server: to.params.id,
                                        },
                                    };
                                },
                            },
                        ]
                    },

                    {
                        name: 'admin.management.users',
                        path: 'users',
                        component: Passthrough,
                        meta: {
                            permission: 'user.read',
                        },
                        children: [
                            {
                                name: 'admin.management.users.index',
                                path: '',
                                component: () => import('~/views/admin/users/Index.vue'),
                                meta: {
                                    icon: 'users',
                                    permission: 'user.read',
                                },
                            },

                            {
                                name: 'admin.management.users.new',
                                path: 'new',
                                component: () => import('~/views/admin/users/manage/About.vue'),
                                meta: {
                                    icon: 'user',
                                    permission: 'user.create',
                                }
                            },
                            {
                                name: 'admin.management.users.manage',
                                path: ':user',
                                component: TabberPassthrough,
                                children: [
                                    {
                                        name: 'admin.management.users.manage.about',
                                        path: '',
                                        component: () => import('~/views/admin/users/manage/About.vue'),
                                        meta: {
                                            icon: 'user',
                                        }
                                    },
                                    {
                                        name: 'admin.management.users.manage.servers',
                                        path: 'servers',
                                        component: () => import('~/views/admin/users/manage/Servers.vue'),
                                        meta: {
                                            icon: 'server',
                                            permission: 'server.read',
                                        }
                                    },
                                ]
                            },
                        ],
                    },
                ]
            },

            {
                name: 'admin.service_management',
                path: '',
                component: Passthrough,
                meta: {
                    showAsCategory: true,
                },
                children: [
                    {
                        name: 'admin.service_management.nests',
                        path: 'nests',
                        component: Passthrough,
                        meta: {
                            permission: 'nest.read',
                        },
                        children: [
                            {
                                name: 'admin.service_management.nests.index',
                                path: '',
                                component: () => import('~/views/admin/nests/Index.vue'),
                                meta: {
                                    icon: 'egg',
                                    permission: 'nest.read',
                                }
                            },

                            {
                                name: 'admin.service_management.nests.manage',
                                path: ':nest',
                                component: () => import('~/views/admin/nests/Manage.vue'),
                                meta: {
                                    icon: 'egg',
                                    permission: 'nest.read',
                                }
                            },

                            {
                                name: 'admin.service_management.nests.egg.new',
                                path: ':nest/egg/new',
                                component: () => import('~/views/admin/nests/eggs/Configuration.vue'),
                                meta: {
                                    icon: 'egg',
                                    permission: 'egg.create',
                                },
                            },

                            {
                                name: 'admin.service_management.nests.egg',
                                path: ':nest/egg/:egg',
                                component: TabberPassthrough,
                                children: [
                                    {
                                        name: 'admin.service_management.nests.egg.configuration',
                                        path: '',
                                        component: () => import('~/views/admin/nests/eggs/Configuration.vue'),
                                        meta: {
                                            icon: 'egg',
                                            permission: 'egg.read',
                                        },
                                    },

                                    {
                                        name: 'admin.service_management.nests.egg.variables',
                                        path: 'variables',
                                        component: () => import('~/views/admin/nests/eggs/Variables.vue'),
                                        meta: {
                                            icon: 'egg',
                                            permission: 'egg_variable.read',
                                        },
                                    },

                                    {
                                        name: 'admin.service_management.nests.egg.scripts',
                                        path: 'scripts',
                                        component: () => import('~/views/admin/nests/eggs/Scripts.vue'),
                                        meta: {
                                            icon: 'egg',
                                            permission: 'egg.read',
                                        },
                                    },

                                    {
                                        name: 'admin.service_management.nests.egg.thumbnail',
                                        path: 'thumbnail',
                                        component: () => import('~/views/admin/nests/eggs/Thumbnail.vue'),
                                        meta: {
                                            icon: 'egg',
                                            permission: 'egg.read',
                                        },
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        name: 'admin.service_management.mods',
                        path: 'mods',
                        component: Passthrough,
                        meta: {
                            permission: 'mod.read',
                        },
                        children: [
                            {
                                name: 'admin.service_management.mods.index',
                                path: '',
                                component: () => import('~/views/admin/mods/Index.vue'),
                                meta: {
                                    icon: 'cubes',
                                    permission: 'mod.read',
                                }
                            },

                            {
                                name: 'admin.service_management.mods.new',
                                path: 'new',
                                component: () => import('~/views/admin/mods/Manage.vue'),
                                meta: {
                                    icon: 'cube',
                                }
                            },

                            {
                                name: 'admin.service_management.mods.manage',
                                path: ':mod',
                                component: () => import('~/views/admin/mods/Manage.vue'),
                                meta: {
                                    icon: 'code-branch',
                                }
                            }
                        ]
                    },
                    {
                        name: 'admin.service_management.domains',
                        path: 'domains',
                        component: Passthrough,
                        meta: {
                            permission: 'domain.read',
                        },
                        children: [
                            {
                                name: 'admin.service_management.domains.index',
                                path: '',
                                component: () => import('~/views/admin/domains/Index.vue'),
                                meta: {
                                    icon: 'globe',
                                    permission: 'domain.read',
                                },
                            },
                            {
                                name: 'admin.service_management.domains.new',
                                path: 'new',
                                component: () => import('~/views/admin/domains/manage/Configuration.vue'),
                                meta: {
                                    icon: 'globe',
                                }
                            },
                            {
                                name: 'admin.service_management.domains.manage',
                                path: ':domain',
                                component: TabberPassthrough,
                                children: [
                                    {
                                        name: 'admin.service_management.domains.manage.configuration',
                                        path: 'configuration',
                                        component: () => import('~/views/admin/domains/manage/Configuration.vue'),
                                        meta: {
                                            icon: 'globe',
                                        },
                                    },
                                    {
                                        name: 'admin.service_management.domains.manage.servers',
                                        path: 'servers',
                                        component: () => import('~/views/admin/domains/manage/Servers.vue'),
                                        meta: {
                                            icon: 'globe',
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                ]
            }
        ],
    },
    {
        name: '404',
        path: '/:catchAll(.*)',
        component: NotFoundView,
    },
];

routes.forEach(Router.addRoute);
