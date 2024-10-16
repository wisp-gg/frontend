<template>
    <footer>
        <div class="w-full text-center py-5">
            <span v-tippy="[nodeDescription, 'top', true]">
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
            'de-nur': 'Germany, Nuremberg',
            'us-chi': 'United States, Chicago',
            'local': 'local dev'
        };

        const node = window.Wisp.Node || 'unknown';
        const [country, cityAndNumber] = node.split('-');

        const nodeLocation = `${country}${cityAndNumber ? `-${cityAndNumber.slice(0, -2)}` : ''}`;
        const location = nodeIdentifierMap[nodeLocation] || 'Unknown Location';

        const nodeDescription = `You are geo-routed to our web server in ${location}. We've automatically chosen this location to give you the fastest experience possible.`;

        return {
            version,
            nodeDescription,
        };
    }
});
</script>
