// https://youtu.be/2LCo926NFLI?si=FS8vdlASwnnMmIOZ
// based on fireship video, "RxJS Quick Start with Practical Examples", but made changes to modern rxjs

// helper function to print to the dom
function print(val) {
  let el = document.createElement("p")
  el.innerHTML = val
  document.body.appendChild(el)
}

// observable
const { Observable, fromEvent, from, timer, interval, of, zip, forkJoin, catchError, retry, Subject } = rxjs
const {
  shareReplay,
  finalize,
  map,
  tap,
  filter,
  first,
  last,
  throttleTime,
  debounceTime,
  scan,
  switchMap,
  takeUntil,
  takeWhile,
  delay,
  multicast,
  share,
} = rxjs.operators

// Observable
const observable = new Observable((observer) => {
  observer.next("hello")
  observer.next("world")
})
observable.subscribe((val) => print(val))

// fromEvent
const clicks = fromEvent(document, "click")
clicks.subscribe((click) => console.log(click))

//
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("resolved")
  }, 1000)
})

// from
const fromObservable = from(promise)
fromObservable.subscribe((result) => print(result))

// timer
const timerObservable = timer(2000)
timerObservable.subscribe(() => print("ding"))

// interval
const intervalObservable = interval(1000)
intervalObservable.subscribe(() => print(`${new Date().getMinutes()}:${new Date().getSeconds()}`))

// of
const ofObservable = of("anything", ["you", "want"], 23, true, { cool: "stuff" })
ofObservable.subscribe((val) => print(JSON.stringify(val)))

// cold
const cold = new Observable((observer) => {
  observer.next(Math.random())
})
cold.subscribe((a) => print(`cold subscriber a: ${a}`))
cold.subscribe((b) => print(`cold subscriber b: ${b}`))

// hot
const x = Math.random()
const hot = new Observable((observer) => {
  observer.next(x)
})
hot.subscribe((a) => print(`hot subscriber a: ${a}`))
hot.subscribe((b) => print(`hot subscriber b: ${b}`))

// shareReplay
const hot2 = cold.pipe(shareReplay(0))
hot2.subscribe((a) => print(`hot2 subscriber a: ${a}`))
hot2.subscribe((b) => print(`hot2 subscriber b: ${b}`))

// finally -> finalize
const timerObservable2 = timer(3000)
timerObservable2.pipe(finalize(() => print("all done"))).subscribe()

// map
const numbers = of(10, 100, 1000)
numbers.pipe(map((num) => Math.log(num))).subscribe((x) => print(`log: ${x}`))

// map with JSON.parse
const jsonString = '{"type": "Dog", "breed": "Pug"}'
const apiCall = of(jsonString)
apiCall.pipe(map((json) => JSON.parse(json))).subscribe((obj) => {
  print(`type: ${obj.type}`)
  print(`breed: ${obj.breed}`)
})

// do -> tap
const names = of("Simon", "Garfunkel")
names
  .pipe(
    tap((name) => print(`${name}`)),
    map((name) => name.toUpperCase()),
    tap((name) => print(`${name}`))
  )
  .subscribe()

// filter
const numbers2 = of(-3, 5, 7, 2, -7, 9, -2)
numbers2.pipe(filter((n) => n >= 0)).subscribe((x) => print(x))

// first, last
numbers2.pipe(first()).subscribe((x) => print(`first: ${x}`))
numbers2.pipe(last()).subscribe((x) => print(`last: ${x}`))

let mouseEvents = fromEvent(document, "mousemove")

// throttleTime
mouseEvents.pipe(throttleTime(1000)).subscribe((e) => console.log(`throttleTime: ${e.type}`))

// debounceTime
mouseEvents.pipe(debounceTime(1000)).subscribe((e) => console.log(`debounceTime: ${e.type}`))

// scan (similar to reduce)
const clicks2 = fromEvent(document, "click")
clicks2
  .pipe(
    map((e) => parseInt(Math.random() * 10)),
    tap((score) => print(`click scored: ${score}`)),
    scan((highScore, score) => highScore + score)
  )
  .subscribe((highScore) => print(`high score: ${highScore}`))

// switchMap
const clicks3 = fromEvent(document, "click")
clicks3
  .pipe(
    switchMap((click) => {
      return interval(1000)
    })
  )
  .subscribe((i) => print(i))

// takeUntil
const interval2 = interval(500)
const notifier = timer(2000)

interval2
  .pipe(
    takeUntil(notifier),
    finalize(() => print("complete"))
  )
  .subscribe((i) => print(i))

// takeWhile
const names2 = of("name1/3", "name2/3", "name3/3", "last")
names2.pipe(takeWhile((name) => name !== "last")).subscribe((name) => print(name))

// zip
const yin = of("beer", "soju")
const yang = of("chicken", "kimchi")
const combo = zip(yin, yang)
combo.subscribe((val) => print(val))

// forkJoin
const api1 = of("api1:data1", "api1:data2")
const api2 = of("api2:data3", "api2:data4").pipe(delay(2000))
const apiCombo = forkJoin(api1, api2)
apiCombo.subscribe((arr) => print(arr))

// catch -> catchError
const observable2 = new Observable((observer) => {
  observer.next("good")
  observer.next("great")
  observer.next("grand")
  throw "catch me"
  observer.next("wonderful")
})
observable2
  .pipe(
    catchError((err) => {
      print(`error caught: ${err}`)
      return of("recovered from error")
    })
  )
  .subscribe((val) => print(val))

// retry
const observable3 = new Observable((observer) => {
  observer.next("retry1")
  observer.next("retry2")
  throw "retry error"
  observer.next("♻️")
})
observable3
  .pipe(
    retry(2), // initial try + 2 retries
    catchError((err) => {
      print(`error caught: ${err}`)
      return of("recovered from error after retrying")
    })
  )
  .subscribe((val) => print(val))

// Subject
const subject = new Subject()
subject.subscribe((val) => print(`subject a: ${val}`))
subject.subscribe((val) => print(`subject b: ${val}`))
subject.next("hello")
setTimeout(() => {
  subject.next("world")
}, 1000)

// multicast
const observable4 = fromEvent(document, "click")
const clicks4 = observable4.pipe(
  tap(() => print("do one time")),
  multicast(() => new Subject())
)
const multicastA = clicks4.subscribe((c) => print(`multicastA: ${c.timeStamp}`))
const multicastB = clicks4.subscribe((c) => print(`multicastB: ${c.timeStamp}`))
clicks4.connect()

// share
const observable5 = fromEvent(document, "click")
const clicks5 = observable5.pipe(
  tap(() => print("do one time")),
  share()
)
const shareA = clicks5.subscribe((c) => print(`shareA: ${c.timeStamp}`))
const shareB = clicks5.subscribe((c) => print(`shareB: ${c.timeStamp}`))
clicks5.connect()
