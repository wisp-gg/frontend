<template>
    <ul v-if="paginationData.totalPages > 1">
        <li :class="firstPage ? ['disabled'] : []">
            <button @click="setPage(currentPage - 1)">
                ‹
            </button>
        </li>
        <li v-for="page of pageElements" :class="currentPage === page && ['active'] || page === '...' && ['disabled'] || []">
            <button @click="setPage(page)">
                {{ page }}
            </button>
        </li>
        <li :class="lastPage ? ['disabled'] : []">
            <button @click="setPage(currentPage + 1)">
                ›
            </button>
        </li>
    </ul>
</template>

<style scoped>
    ul {
        display: flex;
        padding-left: 0;
        list-style: none;
        border-radius: .25rem;
    }

    a, button {
        display: inline-block;
        line-height: 1.25;

        background: #1D1C39;
        color: rgba(255,255,255,.5) !important;
        border: none !important;
        padding: 1rem 1.4rem;
        box-shadow: none !important;
    }

    a:hover, button:hover {
        background: #242344;
    }

    button:focus {
        outline: none;
    }

    li.active > button {
        pointer-events: none;
        border: none !important;
        background: #242344 !important;
    }

    li.disabled > button {
        pointer-events: none;
        border: none !important;
        background: rgba(255,255,255,.025) !important;
    }

    li:first-child > button {
        border-radius: .25rem 0 0 .25rem;
    }

    li:last-child > button {
        border-radius: 0 .25rem .25rem 0;
    }
</style>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue';

export default defineComponent({
    props: {
        paginationData: {
            type: Object as PropType<PaginationResponse>,
            required: true,
        },
        setPage: {
            type: Function,
            required: true,
        },
    },

    setup(props) {
        return {
            currentPage: computed(() => props.paginationData.currentPage),
            firstPage: computed(() => props.paginationData.currentPage === 1),
            lastPage: computed(() => props.paginationData.currentPage === props.paginationData.totalPages),
            pageElements: computed(() => {
                const pages = [];
                const offset = 3;

                const currentPage = props.paginationData.currentPage;
                const totalPages = props.paginationData.totalPages;
                if (currentPage - offset > 1) {
                    pages.push(1);
                    pages.push('...');
                }

                for(let i = Math.max(1, currentPage - offset); i <= Math.min(totalPages, currentPage + offset); i++) {
                    pages.push(i);
                }

                if (currentPage + offset < totalPages) {
                    pages.push('...');
                    pages.push(totalPages);
                }

                return pages;
            }),
        };
    },
});
</script>
