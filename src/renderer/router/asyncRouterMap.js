import Layout from '@/layout'
export default [
  {
    path: '/form',
    component: Layout,
    meta: { title: 'Форма', icon: 'form', roles: ['admin', 'edit'] },
    children: [
      {
        path: 'index',
        name: 'Form',
        component: () => import('@/views/form/index'),
        meta: { title: 'Форма', icon: 'Grid' }
      }
    ]
  },
  {
    path: '/monitor',
    component: Layout,
    meta: { roles: ['admin','edit'] },
    children: [
      {
        path: 'index',
        name: 'Мониторинг',
        component: () => import('@/views/monitor/index'),
        meta: { title: 'Мониторинг', icon: 'View' }
      }
    ]
  },
  {
    path: '/table',
    component: Layout,
    meta: { roles: ['admin', 'edit'] },
    children: [
      {
        path: 'index',
        name: 'Таблица',
        component: () => import('@/views/table/index'),
        meta: { title: 'Таблица', icon: 'Grid' }
      }
    ]
  },
  {
    path: '/permission',
    component: Layout,
    meta: { roles: ['admin'] },
    children: [
      {
        path: 'index',
        name: 'Доступ',
        component: () => import('@/views/permission/index'),
        meta: { title: 'Доступ', icon: 'Monitor' }
      }
    ]
  }
]
