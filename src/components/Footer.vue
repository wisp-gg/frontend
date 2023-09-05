<template>
    <footer>
        <div class="w-full text-center py-5">
            <span v-tippy="setTippyContent" :data-content="nodeDescription">
                <fa :icon="['fas', 'code-branch']" /> {{ version }}
            </span>
        </div>
    </footer>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

export default defineComponent({
    setup() {
        const version = computed(() => `${window.Wisp.Node || 'unknown'} - ${window.Wisp.Version || 'unknown'}`);

        type NodeIdentifierToLocation = {
            [key: string]: string;
        };

        const nodeIdentifierMap: NodeIdentifierToLocation  = {
            'nl-ams': 'Netherlands, Amsterdam',
            'au-syd': 'Australia, Sydney',
            'fr-gra': 'France, Gravelines',
            'sg-sin': 'Singapore, Singapore',
            'ca-mnt': 'Canada, Montreal',
            'local': 'local dev'
        };

        const node = window.Wisp.Node || 'unknown';
        const nodeName = node.split('-web')[0];
        const location = nodeIdentifierMap[nodeName] || 'Unknown Location';

        const nodeDescription = `You are geo-routed to our web server in ${location}. We've automatically chosen this location to give you the fastest experience possible.`;

        const setTippyContent = (el) => {
            return el.dataset.content || 'Unknown';
        };

        return {
            version,
            nodeDescription,
            setTippyContent
        };
    }
});
</script>
