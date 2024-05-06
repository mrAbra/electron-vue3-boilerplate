/**
 * 性能工具
 * 1. 计算方法执行时间
 * @returns {void}
 * @date 2019-11-29
 */
import Timer from './timer'
class Performance {
  /**
     * 计算情况
     * @returns {Function}  执行返回值获取时间信息
     * @date 2019-11-29
     */
  startExecute (name = '') {
    const timer = Timer.start()
    const usedJSHeapSize = this.getMemoryInfo().usedJSHeapSize
    return (name2 = '') => {
        const executeTime = timer.stop()
        const endMemoryInfo = this.getMemoryInfo()
        console.log('%cПроизводительность%c \n1. Выполняемый метод: %c%s%c\n2. Время выполнения: %c%sмс%c \n3. Флуктуация памяти: %sB \n4. Выделено памяти: %sМБ \n5. Использовано памяти: %sМБ \n6. Оставшаяся память: %sМБ',
            'padding: 2px 4px 2px 4px; background-color: #4caf50; color: #fff; border-radius: 4px;', '',
            'color: #ff6f00', `${name} ${name2}`, '',
            'color: #ff6f00', executeTime, '',
            endMemoryInfo.usedJSHeapSize - usedJSHeapSize,
            this.toMBSize(endMemoryInfo.jsHeapSizeLimit),
            this.toMBSize(endMemoryInfo.usedJSHeapSize),
            this.toMBSize(endMemoryInfo.totalJSHeapSize)
        )
    }
  }

  /**
     * 获取内存信息
     * @returns {void}
     * @date 2019-11-29
     */
  getMemoryInfo () {
    let memoryInfo = {}
    if (window.performance && window.performance.memory) {
      memoryInfo = window.performance.memory
    }
    return memoryInfo
  }

  /**
     * 转化为MB
     * @returns {void}
     * @date 2019-11-29
     */
  toMBSize (byteSize) {
    return (byteSize / (1024 * 1024)).toFixed(1)
  }
}

export default new Performance()
