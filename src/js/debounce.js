/**
 *  描述： 在 wait 时间内触发多次执行，只会执行最后一次
 * @param {防抖需要执行的函数} func
 * @param {等待的时间} wait
 * @returns
 */
function debounce (func, wait = 60) {
  let timer = 0
  return function (...args) {
    if (timer) { clearTimeout(timer) }
    timer = setTimeout(() => {
      func.apply(this, args)
    }, wait);
  }
}


/**
 * 描述： 按照一段时间的间隔来进行触发
 * @param {需要执行的函数} func
 * @param {等待的时间} wait
 */
function throttle (func, wait = 60) {
  // // setTimeout 方案 第一次执行会等待 wait 时间后执行
  // let timer = 0
  // return function (...args) {
  //   if (timer) { return }
  //   timer = setTimeout(() => {
  //     func.apply(this, args)
  //     timer = 0
  //   }, wait);
  // }

  // 时间戳  func第一次会立即执行
  let lastTime = 0
  return function (...args) {
    let now = +new Date()
    if (now - lastTime > wait) {
      lastTime = now
      func.apply(this, args)
    }
  }
}
/**
 *
 * @param {对象} instance
 * @param {构造函数或类} Func
 */
function myInstanceOf (instance, FuncOrClass) {
  if (!['object', 'function'].includes(typeof instance) || instance === null) { return false }
  // 获取构造函数原型
  let proto = FuncOrClass.prototype
  // 获取对象原型
  let instanceProto = Object.getPrototypeOf(instance)
  while (instanceProto !== null) {
    if (instanceProto === proto) {
      return true
    }
    instanceProto = Object.getPrototypeOf(instanceProto)
  }
  return false
}

/**
 *
 * @param {构造函数} Func
 * @param  {参数} args
 * @returns
 */
function myNew (Func, ...args) {
  const ctx = Object.create(Func.prototype)
  const res = Func.apply(ctx, args)
  return (typeof res === 'object' && res !== null) ? res : ctx
}
/**
 *
 * @param {需要替换的上下文} ctx
 * @param  {参数} args
 * @returns 函数执行的结果
 */
Function.prototype.myCall = function (ctx = window, ...args) {
  let func = this
  let fnKey = Symbol()
  ctx[fnKey] = func
  const res = ctx[fnKey](...args)
  Reflect.deleteProperty(ctx, fnKey)
  return res
}
/**
 *
 * @param {需要替换的上下文} ctx
 * @param  {参数} args
 * @returns 函数执行的结果
 */
Function.prototype.myApply = function (ctx = window, args) {
  let func = this
  let fnKey = Symbol()
  ctx[fnKey] = func
  const res = ctx[fnKey](...args)
  Reflect.deleteProperty(ctx, fnKey)
  return res
}

/**
 *
 * @param {需要替换的上下文} ctx
 * @param  {参数} args
 * @returns 函数执行的结果
 */
Function.prototype.myBind = function (ctx = window, ...args) {
  let func = this
  //返回了一个函数，...inArgs为实际调用时传入的参数
  const innerFn = function (...inArgs) {
    //this instanceof fBound为true表示构造函数的情况。如new func.bind(obj)
    // 当作为构造函数时，this 指向实例，此时 this instanceof fBound 结果为 true，可以让实例获得来自绑定函数的值
    // 当作为普通函数时，this 默认指向 window，此时结果为 false，将绑定函数的 this 指向 context
    return func.apply(this instanceof innerFn ? this : ctx, ...[...args, ...inArgs])
  }
  // 如果绑定的是构造函数，那么需要继承构造函数原型属性和方法：保证原函数的原型对象上的属性不丢失
  // 实现继承的方式: 使用Object.create
  innerFn.prototype = Object.create(func.prototype)
  return innerFn
}

/**
 *
 * @param {克隆对象} value
 * @param {存放克隆的对象} weakMap
 * @returns
 */

function deepClone (value, weakMap = new WeakMap()) {
  if (typeof value !== 'object' || value === null) {
    return value;
  }
  if (value instanceof RegExp) {
    return new RegExp(value);
  }
  if (value instanceof Date) {
    return new Date(value);
  }
  let res = new value.constructor();
  if (weakMap.has(value)) {
    return weakMap.get(value);
  }
  weakMap.set(value, res);
  for (let key in value) {
    if (value.hasOwnProperty(key)) {
      res[key] = deepClone(value[key], weakMap);
    }
  }
  return res;
}

/**
 *
 * @param {} param
 * @returns promise
 */
Promise.myResolve = function (param) {
  if (param instanceof Promise) return param;
  return new Promise(function (resolove, reject) {
    if (param.then && typeof param.then === 'function') {
      param.then(resolove, reject)
    } {
      resolove(param)
    }
  })
}

/**
 *
 * @param {*} param
 * @returns  promise
 */
Promise.myReject = function (reason) {
  return new Promise(function (_, reject) {
    reject(reason)
  })
}


/**
 * 描述： list中有一个rejected 直接返回  promis 为rejected 返回返回完成的list
 * @param {promises list} promises
 * @returns  promis
 */
Promise.myAll = function (promises) {
  return new Promise(function (resolve, reject) {
    let result = []
    let index = 0
    let len = promises.length
    if (!len) {
      return resolve(result)
    }
    for (let i = 0; i < len; i++) {
      Promise.resolve(promises[i]).then((data) => {
        result[i] = data
        index++
        if (index === len) {
          resolve(result)
        }
      }).catch(reject)
    }
  })
}
/**
 * 描述：promis list 都完成 不管成功失败  promis 就完成
 * @param {promis list} promises
 */
Promise.myAllSettled = function (promises) {

  return new Promise(function (resolve, reject) {
    let result = []
    let index = 0
    let len = promises.length
    if (!len) {
      return resolve(result)
    }
    for (let i = 0; i < len; i++) {
      Promise.resolve(promises[i]).then((data) => {
        setData(index, { status: 'fulfilled', value: data })
      }).catch((err) => {
        setData(index, { status: 'rejected', value: err })
      })
    }
    setData = (idx, res) => {
      index++
      result[idx] = res
      if (index === len) {
        resolve(result)
      }
    }
  })
}

/**
 *  描述： list 中只要有一个成功或者失败 返回的promise 即为最快成功的promise 状态
 * @param {list} promises
 * @returns
 */

Promise.myRace = function (promises) {

  return new Promise(function (resolve, reject) {
    let len = promises.length
    if (!len) {
      return resolve(result)
    }
    for (let i = 0; i < len; i++) {
      Promise.resolve(promises[i]).then((data) => {
        resolve(data)
        return
      }).catch((err) => {
        reject(err)
        return
      })
    }
  })
}

// 字符串最长的不重复子串
// lengthOfLongestSubstring('abcabcbb')
function lengthOfLongestSubstring (str) {
  let len = str.length
  let startStr = ''
  let startIndex = 0
  let mapArr = []
  for (let i = 1; i < len; i++) {
    startStr = str.slice(startIndex, i)
    let index = startStr.indexOf(str[i])
    if (index > -1) {
      startIndex = startIndex + index + 1
    } else {
      let resStr = startStr + str[i]
      mapArr.push({
        str: resStr,
        len: resStr.length
      })
    }

  }
  return mapArr

}








