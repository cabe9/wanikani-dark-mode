import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import vm from 'node:vm'
const source = await readFile(new URL('../src/scripts/review-dark-mode.user.js', import.meta.url), 'utf8').catch(() => readFile(new URL('../review-dark-mode.user.js', import.meta.url), 'utf8'))
const usercss = await readFile(new URL('../src/styles/wanikani-dark-mode.user.css', import.meta.url), 'utf8').catch(() => readFile(new URL('../wanikani-dark-mode.user.css', import.meta.url), 'utf8'))
function run(hostname) {
    const styles = [], listeners = [], classes = new Set()
    const document = {
        documentElement: {appendChild: s => styles.push(s), classList: {add: c => classes.add(c), remove: (...cs) => cs.forEach(c => classes.delete(c))}},
        createElement: () => ({}), getElementById: id => styles.find(s => s.id === id),
        addEventListener: name => listeners.push(name),
    }
    const window = {location: {hostname, pathname: '/t/test/1'}, addEventListener: name => listeners.push(name)}
    vm.runInNewContext(source, {window, document, MutationObserver: class {constructor() {throw Error('Unexpected observer')}}})
    return {styles, listeners, classes}
}
const forum = run('community.wanikani.com')
assert.equal(forum.styles.length, 1)
assert(forum.styles[0].textContent.includes('--scheme-type: dark'))
assert(!forum.styles[0].textContent.includes('.quiz-input'))
assert.equal(forum.listeners.length, 0)
assert(forum.classes.has('wkrd-active'))
for (const hostname of ['www.wanikani.com', 'preview.wanikani.com']) {
    const app = run(hostname)
    assert.equal(app.styles.length, 1)
    assert(app.styles[0].textContent.includes('.quiz-input'))
    assert(!app.styles[0].textContent.includes('--scheme-type: dark'))
    assert(app.listeners.includes('turbo:load'))
}
const sections = usercss.split('@-moz-document ')
assert.equal(sections.length, 3)
assert(!sections[1].includes('community.wanikani.com'))
assert(sections[2].startsWith('url-prefix("https://community.wanikani.com/")'))
assert(!sections[2].includes('.quiz-input'))
assert(sections[2].includes(forum.styles[0].textContent.trim().split('\n')[0]))
console.log('PASS: forum and learning-site CSS are isolated in both editions; no quiz observers run on Discourse')
