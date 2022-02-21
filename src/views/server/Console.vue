<template>
    <div>
        <div class="flex flex-grow" ref="terminalElement" />
        <div class="flex terminal-input">
            <div class="text-gray-300 terminal-prompt">
                root:~/<span class="text-accent-500">$</span>
            </div>
            <v-input
                class="flex-grow"
                name=""
                permission="control.command"
                v-model:value="textInput"
                @keydown="inputKeyDown"
                no-margin
                hide-label
            />
            <div class="flex flex-row items-center justify-center pr-2">
                <upload-logs-button />
                <v-button v-tippy="'server.console.console_popup'" class="p-4 hover:text-white" @click="server?.openConsolePopup()">
                    <fa :icon="['fas', 'external-link-square-alt']" size="lg" />
                </v-button>
            </div>
        </div>
    </div>
</template>

<style>
    .terminal {
        padding: 1rem 1rem 0 1rem;
    }

    .xterm {
        flex-grow: 1;
        font-family: "JetBrains Mono", monospace;
    }

    .xterm-viewport {
        border-radius: 5px 5px 0 0;
    }

    .terminal-input {
        background-color: #181818 !important;
        border-radius: 0 0 5px 5px !important;
    }

    .terminal-input input {
        background-color: #181818 !important;
    }

    .terminal-input input:focus {
        background-color: #181818 !important;
    }

    .terminal-prompt {
        padding: 1rem .5rem 1rem 1.5rem;
    }
</style>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { debounce } from 'debounce';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { SearchAddon } from 'xterm-addon-search';
import { SearchBarAddon } from 'xterm-addon-search-bar';
import { WebLinksAddon } from 'xterm-addon-web-links';
import 'xterm/css/xterm.css';

import { Logger, state } from '~/core';
import { ConsoleMessageType } from '~/api/services/daemon';
import { useDaemonEvent, triggerDaemonAction, useWindowEvent, onModelLoaded, hasPermissions, translateRequiresPermissions } from '~/plugins';
import UploadLogsButton from '~/views/server/UploadLogsButton.vue';

const ansi = {
    reset: '\u001b[0m',
    bold: '\u001b[1m',
    underline: '\u001b[4m',
    bgRed: '\u001b[41m',
    black: '\u001b[30m',
    red: '\u001b[31m',
    green: '\u001b[32m',
    yellow: '\u001b[33m',
    blue: '\u001b[34m',
    magenta: '\u001b[35m',
    cyan: '\u001b[36m',
    white: '\u001b[37m',
};

export default defineComponent({
    components: { UploadLogsButton },
    setup() {
        const { t } = useI18n();

        const terminalElement = ref<HTMLElement | undefined>();
        const textInput = ref('');
        onMounted(() => {
            if (!terminalElement.value) throw new Error('Unable to initialize console - terminal element is missing?');

            const terminal = new Terminal({
                allowTransparency: true,
                cursorStyle: 'underline',
                disableStdin: true,
                fontSize: 14,
                fontFamily: 'JetBrains Mono',
                fontWeight: 'normal',
                lineHeight: 1.1,
                rows: 30,
                scrollback: 1000,
                theme: {
                    background: '#1c1c1c',
                    cursor: 'transparent',
                    black: '#000000',
                    red: '#E54B4B',
                    green: '#9ECE58',
                    yellow: '#FAED70',
                    blue: '#396FE2',
                    magenta: '#BB80B3',
                    cyan: '#2DDAFD',
                    white: '#d0d0d0',
                    brightBlack: 'rgba(255, 255, 255, 0.2)',
                    brightRed: '#FF5370',
                    brightGreen: '#C3E88D',
                    brightYellow: '#FFCB6B',
                    brightBlue: '#82AAFF',
                    brightMagenta: '#C792EA',
                    brightCyan: '#89DDFF',
                    brightWhite: '#ffffff',
                    selection: 'rgba(26, 212, 168, 0.25)',
                },
            });

            const fitAddon = new FitAddon();
            const searchAddon = new SearchAddon();
            const searchBarAddon = new SearchBarAddon({ searchAddon });

            terminal.loadAddon(fitAddon);
            terminal.loadAddon(searchAddon);
            terminal.loadAddon(searchBarAddon);
            terminal.loadAddon(new WebLinksAddon());

            terminal.open(terminalElement.value);
            fitAddon.fit();

            useWindowEvent('resize', debounce(() => {
                // https://github.com/xtermjs/xterm.js/issues/3564
                let lastCols, lastRows;
                let loop = true;
                while(loop) {
                    const { cols, rows } = fitAddon.proposeDimensions();
                    fitAddon.fit();

                    if (cols === lastCols && rows === lastRows) loop = false;

                    lastCols = cols;
                    lastRows = rows;
                }
            }, 100));

            let hooked = false;
            const hookSearchBarKeyEvents = () => {
                if (hooked) return;
                hooked = true;

                (<any> searchBarAddon).on('.search-bar__input', 'keyup', (evt: KeyboardEvent) => {
                    if (evt.key === 'Escape') {
                        searchBarAddon.hidden();
                    }
                });
            };

            terminal.attachCustomKeyEventHandler(evt => {
                const ctrl = evt.ctrlKey || evt.metaKey;
                switch(evt.key) {
                    case 'c': {
                        if (ctrl) {
                            document.execCommand('copy');
                            return false;
                        }
                        break;
                    }
                    case 'f': {
                        if (ctrl) {
                            evt.preventDefault();
                            searchBarAddon.show();
                            hookSearchBarKeyEvents();

                            return false;
                        }
                        break;
                    }
                    case 'Escape': {
                        searchBarAddon.hidden();
                        break;
                    }
                }

                return true;
            });

            useDaemonEvent('console-output', data => {
                switch(data.type) {
                    case ConsoleMessageType.DAEMON: {
                        const prefix = `${ansi.bold}${ansi.yellow}[${data.translationData.displayName || 'WISP'}] ${ansi.reset}`;
                        delete data.translationData.displayName;

                        const translated = t(`daemon.${data.line}`, {
                            ...ansi,
                            ...data.translationData,
                        });

                        terminal.writeln(
                            `${prefix}${translated}${ansi.reset}`
                        );
                        break;
                    }

                    case ConsoleMessageType.PROCESS: {
                        data.line.split(/\n/g).forEach((line: string) => terminal.writeln(line));
                        break;
                    }

                    default: {
                        Logger.warn('Console', `Unhandled console message type: ${data.type}`);
                        break;
                    }
                }
            });

            useDaemonEvent('connected', () => {
                terminal.clear();

                if (!hasPermissions('control.console')) {
                    terminal.writeln(
                        translateRequiresPermissions('control.console')
                    );
                }

                triggerDaemonAction('request-logs');
            });

            if (state.server.socket.connected) {
                triggerDaemonAction('request-logs');
            }
        });

        const historyMaxLength = 15;
        let history: string[] = [];
        let historyIndex = history.length;

        let storageKey = 'server:unknown';
        onModelLoaded('server', server => {
            storageKey = `server:${server.uuidShort}`;

            try {
                history = JSON.parse(
                    localStorage.getItem(storageKey) || ''
                );
                historyIndex = history.length;
            } catch(err) {
                // ignore corrupted data
            }
        });

        return {
            terminalElement,
            textInput,
            server: computed(() => state.models.server),
            inputKeyDown: (e: KeyboardEvent) => {
                // Although keyCode is deprecated, it seems that in certain cases the browser sends fancier key names
                // that aren't fully documented? (e.g. Enter also has "Middle Enter" and "Numpad Enter", etc.)
                // @see https://github.com/wisp-gg/frontend/issues/139
                switch(e.keyCode) {
                    case 38: { // ArrowUp
                        e.preventDefault();

                        historyIndex = Math.max(0, historyIndex - 1);
                        if (historyIndex < history.length) {
                            textInput.value = history[historyIndex];
                        }
                        break;
                    }
                    case 40: { // ArrowDown
                        historyIndex = Math.min(history.length, historyIndex + 1);
                        if (historyIndex < history.length) {
                            textInput.value = history[historyIndex];
                        } else {
                            textInput.value = '';
                        }
                        break;
                    }
                    case 13: { // Enter
                        const input = textInput.value;
                        if (!input || input.trim() === '') return;

                        history.push(input);
                        if (history.length > historyMaxLength) {
                            history.splice(0, history.length - historyMaxLength);
                        }
                        localStorage.setItem(storageKey, JSON.stringify(history));

                        historyIndex = history.length;

                        triggerDaemonAction('send-command', input);
                        textInput.value = '';
                        break;
                    }
                }
            },
        };
    },
});
</script>
