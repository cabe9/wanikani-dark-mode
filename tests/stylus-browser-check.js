// Run in the dashboard's browser console with only the Stylus edition enabled.
// Temporary offscreen markup exercises CSS state changes without submitting answers.
(async () => {
    if (!location.pathname.startsWith('/dashboard')) throw new Error('Run on the dashboard')
    if (document.getElementById('wkrd-styles') || document.documentElement.classList.contains('wkrd-active')) {
        throw new Error('Disable the Tampermonkey theme and reload before testing')
    }
    const results = []
    const check = (name, passes, detail) => {
        results.push({name, passes, detail})
        console.log(`STYLUS_TEST ${passes ? 'PASS' : 'FAIL'} ${name}: ${detail}`)
    }
    const bg = element => getComputedStyle(element).backgroundColor
    const fixture = document.createElement('div')
    fixture.style.cssText = 'position:fixed;left:-10000px;top:0;width:800px;visibility:hidden;pointer-events:none'
    fixture.setAttribute('aria-hidden', 'true')
    const quiz = document.createElement('div')
    quiz.className = 'quiz-input'
    const question = document.createElement('div')
    question.className = 'quiz-input__question-type-container'
    const answer = document.createElement('div')
    answer.className = 'quiz-input__input-container'
    const input = document.createElement('input')
    input.className = 'quiz-input__input'
    const submit = document.createElement('button')
    submit.className = 'quiz-input__submit-button'
    answer.append(input, submit)
    quiz.append(question, answer)
    fixture.append(quiz)
    document.body.append(fixture)
    try {
        const inspect = (name, inputColor, panelColor, questionColor) => {
            const actual = [bg(input), bg(quiz), bg(question)]
            check(name, actual.join('|') === [inputColor, panelColor, questionColor].join('|'), actual.join(' / '))
        }
        const neutral = ['rgb(17, 19, 21)', 'rgb(28, 31, 34)', 'rgb(24, 26, 29)']
        const correct = ['rgb(37, 75, 53)', 'rgb(23, 39, 29)', 'rgb(29, 53, 38)']
        const incorrect = ['rgb(90, 41, 48)', 'rgb(43, 24, 27)', 'rgb(59, 32, 37)']
        inspect('unanswered', ...neutral)
        answer.setAttribute('correct', 'true')
        inspect('correct true', ...correct)
        check('submit feedback', bg(submit) === correct[0], bg(submit))
        answer.setAttribute('correct', '')
        inspect('correct empty', ...correct)
        answer.setAttribute('correct', 'false')
        inspect('correct false', ...incorrect)
        answer.setAttribute('correct', 'true')
        answer.setAttribute('incorrect', '')
        inspect('incorrect wins', ...incorrect)
        answer.removeAttribute('correct')
        inspect('incorrect attribute', ...incorrect)
        answer.removeAttribute('incorrect')
        inspect('undo clears feedback', ...neutral)
        answer.setAttribute('correct', 'true')
        answer.replaceWith(answer.cloneNode(true))
        check('replacement input', bg(quiz) === correct[1], bg(quiz))
        quiz.remove()
        const backgrounds = ['default', 'candy', 'pastel', 'vintage'].map(palette => {
            const widget = document.createElement('div')
            widget.className = `days-studied-widget theme--${palette}`
            const background = document.createElement('div')
            background.className = 'days-studied-widget__background'
            widget.append(background)
            fixture.append(widget)
            const style = getComputedStyle(background)
            check(`${palette} artwork`, style.backgroundImage.includes(`${palette}-dark-void-`) && style.opacity === '0.65', style.backgroundImage.split('/').pop())
            return background
        })
        const firstPosition = getComputedStyle(backgrounds[0]).backgroundPosition
        await new Promise(resolve => setTimeout(resolve, 250))
        const lastPosition = getComputedStyle(backgrounds[0]).backgroundPosition
        check('animation moves', firstPosition !== lastPosition, `${firstPosition} -> ${lastPosition}`)
    } finally {
        fixture.remove()
    }
    console.log(`STYLUS_TEST SUMMARY ${results.filter(r => r.passes).length}/${results.length} passed`)
    return results
})()
