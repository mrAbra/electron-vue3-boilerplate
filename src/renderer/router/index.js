import { createRouter, createWebHistory } from 'vue-router';
import Layout from '@/layout/index.vue';
import asyncRouterMap from './asyncRouterMap';

export const constantRouterMap = [
  {
    path: '/',
    history: createWebHistory(),
    component: Layout,
    redirect: '/dashboard',
    name: 'Главная',
    hidden: true,
    children: [
      {
        path: 'dashboard',
        name: 'Обзор',
        component: () => import('@/components/LandingPage.vue')
      }
    ]
  },
  {
    path: '/login',
    history: createWebHistory(),
    component: () => import('@/views/login'),
    hidden: true
  },
  {
    path: '/:pathMatch(.*)*',
    history: createWebHistory(),
    component: () => import('@/views/404'),
    hidden: true
  },
  {
    path: '/showChart',
    name: 'showChart',
    history: createWebHistory(),
    component: () => import('@/views/emulator'),
  },
  {
    path: '/moreInfo',
    name: 'moreInfo',
    history: createWebHistory(),
    component: () => import('@/views/monitor/additionalinfo'),
  }
];

export const asyncRoutes = asyncRouterMap;

const router = createRouter({
  history: createWebHistory(),
  routes: constantRouterMap
});

export function resetRouter() {
  const newRouter = createRouter({
    history: createWebHistory(),
    routes: constantRouterMap
  });
  router.matcher = newRouter.matcher;
}
export default router;
