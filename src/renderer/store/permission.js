import { defineStore } from "pinia"

// Необходимо передать таблицу маршрутов в заголовок и выполнить это действие при входе пользователя
// Импорт таблицы маршрутов
import { constantRouterMap, asyncRoutes } from '@/router'

/**
 * Определение соответствия текущих прав пользователю по метаданным ролей.
 * Можно изменить в соответствии с собственными требованиями. Например, с использованием побитового AND.
 * @param roles  Права доступа
 * @param route  Общая таблица маршрутов
 */
function hasPermission(roles, route) {
    if (route.meta && route.meta.roles) {
        console.log(route.meta, roles.some(role => route.meta.roles.includes(role)))
        return roles.some(role => route.meta.roles.includes(role))
    } else {
        return true
    }
}

/**
 * Рекурсивная фильтрация асинхронной таблицы маршрутов для возврата таблицы маршрутов, соответствующих правам доступа пользователя.
 * @param routes   Таблица маршрутов, которую нужно отфильтровать
 * @param roles    Права доступа
 */
function filterAsyncRouter(routes, roles) {
    const res = []
    routes.forEach(route => {
        const tmp = { ...route }

        if (hasPermission(roles, tmp)) {
            if (tmp.children) {
                tmp.children = filterAsyncRouter(tmp.children, roles)
            }
            res.push(tmp)
        }
    })
    return res
}

export const usePermissionStore = defineStore({
    id: 'permission',
    state: () => ({
        routers: [],
    }),
    actions: {
        GenerateRoutes(roles) {
            return new Promise(resolve => {
                let accessedRouters = []
                // В этом месте, когда это права администратора, предоставляются все таблицы маршрутов
                if (roles === 'admin') {
                    accessedRouters = asyncRoutes
                } else {
                    accessedRouters = filterAsyncRouter(asyncRoutes, roles)
                }
                console.log("accessedRouters:",accessedRouters)
                this.routers = constantRouterMap.concat(accessedRouters)
                resolve(this.routers)
            })
        },
        ResetRoutes() {
            return new Promise(resolve => {
                this.routers = []
                resolve()
            })
        }
    },
})
