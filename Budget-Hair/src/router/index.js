import { createRouter, createWebHistory } from 'vue-router'
import index from '@/views/index.vue'
import addStock from '@/views/add-stock.vue'
import recordSale from '@/views/record-sale.vue'
import soldItem from '@/views/sold-item.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'index',
      component: index,
    },
    {
      path: '/add-stock',
      name: 'add-stock',
      component: addStock
    },
    {
      path: '/records',
      name: 'records',
      component: recordSale
    },
    {
      path: '/sold-item',
      name: 'sold-item',
      component: soldItem
    },
  ],
})

export default router
