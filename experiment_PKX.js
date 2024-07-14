function introduction() {
    return {
        type: 'html-keyboard-response',
        stimulus: `<h1>N-Back Experiment</h1>
            <p>你将看到一个<b>3x3</b> 网格，网格中的单元格会 <span class="blue"><b>blue</b></span> 呈现蓝色，你需要确定这个单元格是否与 <b>n</b> 步之前的单元格相同。</p>
            <div style="margin: auto; display: inline-block">${empty_grid()}</div>
            <p>如果这个单元格与 <b>n</b>步之前的单元格相同，请按 <b>F</b> 键，否则按<b>j</b>键。</p>`,
        choices: jsPsych.ALL_KEYS,
        data: {
            test_part: 'introduction'
        }
    };
}

function start_card(n) {
    return {
        type: 'html-keyboard-response',
        stimulus: `<h1>${n}-back Session</h1>
            <p>记住这些方块，并选择当前方块是否与 <b>${n}</b> 步之前的方块相同</p>
            <p>如果相同，请按 <b>f</b> 键；否则按<b>j</b> 键</p>
            <p><i>按任意键继续</i></p>`,
        choices: jsPsych.ALL_KEYS,
        data: {
            test_part: 'start_card'
        }
    };
}

function end_card(duration) {
    return {
        type: 'html-keyboard-response',
        trial_duration: duration,
        stimulus: function() {
            const lastData = jsPsych.data.getLastTimelineData();
            const correct_trials = lastData.filter({ test_part: 'n-back', correct: true }).count();
            return `<h1>休息一下吧</h1>
                <div id="progresscircle"></div>
                <p id="Result">你 <b>${correct_trials} / ${stimuli}</b> 出错了</p>`;
        },
        on_load: function() {
            let progressBar = new ProgressBar.Circle('#progresscircle', {
                color: '#6CBAC2',
                strokeWidth: 7,
                trailColor: '#DAE5EB',
                trailWidth: 5,
                easing: 'linear',
                text: {
                    className: 'progressLabel'
                },
                step: function(state, circle) {
                    const value = circle.value();
                    circle.setText(`${(duration / 1000) * value.toFixed(0)}s`);
                }
            });
            progressBar.set(1);
            progressBar.animate(0, { duration: duration });
        },
        choices: jsPsych.NO_KEYS,
        on_finish: function() {
            const lastData = jsPsych.data.getLastTimelineData();
            const correct_trials = lastData.filter({ test_part: 'n-back', correct: true }).count();
            jsPsych.data.addDataToLastTrial({ correct: correct_trials });
        },
        data: {
            test_part: 'end_card'
        }
    };
}

const trials_per_n = 3;
const n_steps = [1, 2, 3];
const stimuli = 15;

const n_back_trial_sequence = jsPsych.randomization.repeat(n_steps, trials_per_n);

n_back_trial_sequence.forEach(function(n) {
    timeline.push({
        timeline: [
            start_card(n),
            n_back_experiment(n, stimuli),
            end_card(8000)
        ]
    });
});
