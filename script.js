// Mapping the Display Name to the actual Folder Name
const topicMapping = [
    { display: "Algebraic functions", folder: "algebraic" },
    { display: "Exponentials", folder: "exponentials" },
    { display: "Logarithms", folder: "logarithms" },
    { display: "Trigonometric functions", folder: "trig" },
    { display: "Inverse trig functions", folder: "inv_trig" },
    { display: "Hyperbolic functions", folder: "hyp" },
    { display: "Inverse hyp functions", folder: "inv_hyp" },
    { display: "Special functions", folder: "special" },
    { display: "Miscellaneous", folder: "misc" }
];

let questions = [];
let results = []; 
const MQ = MathQuill.getInterface(2);
let mathField;

// 1. Build the Menu
const grid = document.getElementById('topic-grid');
topicMapping.forEach((item, idx) => {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${idx + 1}. ${item.display}</td>
        <td><input type="checkbox" class="task-check" data-folder="${item.folder}" data-type="derivative"></td>
        <td><input type="checkbox" class="task-check" data-folder="${item.folder}" data-type="integral"></td>
        <td><input type="checkbox" class="task-check" data-folder="${item.folder}" data-type="other"></td>
    `;
    grid.appendChild(row);
});

// 2. Start Test Logic
document.getElementById('start-test').onclick = async () => {
    const selected = Array.from(document.querySelectorAll('.task-check:checked'));
    questions = []; 
    results = [];

    for (let cb of selected) {
        const folder = cb.dataset.folder;
        const file = cb.dataset.type;
        // Construct path: questions/algebraic/derivative.json
        const path = `questions/${folder}/${file}.json`;

        try {
            const res = await fetch(path);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            
            questions.push(...data.map(q => ({
                ...q, 
                attempts: 0,
                topic: folder
            })));
        } catch (e) {
            console.error("Path failed:", path);
            alert(`Could not find file: ${path}\n\nMake sure the 'questions' folder is in the same place as index.html and the folder/file names match exactly (lowercase).`);
            return; // Stop if a file is missing
        }
    }

    if (questions.length > 0) {
        questions.sort(() => Math.random() - 0.5);
        startQuiz();
    }
};

// Checkbox listener
document.addEventListener('change', () => {
    const checked = document.querySelectorAll('.task-check:checked').length;
    document.getElementById('start-test').disabled = checked === 0;
});

document.getElementById('show-options').onclick = () => {
    document.getElementById('options-dropdown').classList.remove('hidden');
    document.getElementById('show-options').classList.add('hidden');
};

function startQuiz() {
    document.getElementById('menu-screen').classList.add('hidden');
    document.getElementById('test-screen').classList.remove('hidden');
    mathField = MQ.MathField(document.getElementById('math-input'));
    showQuestion();
}

function showQuestion() {
    if (questions.length === 0) return showResults();
    MQ.StaticMath(document.getElementById('math-question')).latex(questions[0].q);
    mathField.latex('');
    document.getElementById('feedback').innerText = '';
    mathField.focus();
}

document.getElementById('submit-answer').onclick = () => {
    if (questions.length === 0) return;
    const userAnswer = mathField.latex().replace(/[\s{}]/g, '');
    const correctAnswer = questions[0].a.replace(/[\s{}]/g, '');
    const q = questions[0];
    q.attempts++;

    if (userAnswer === correctAnswer) {
        results.push(q);
        questions.shift();
        document.getElementById('feedback').innerHTML = "<span style='color:green'>Correct!</span>";
        setTimeout(showQuestion, 500);
    } else {
        document.getElementById('feedback').innerHTML = "<span style='color:red'>Incorrect.</span>";
        questions.push(questions.shift());
        setTimeout(showQuestion, 800);
    }
};

function showResults() {
    document.getElementById('test-screen').classList.add('hidden');
    document.getElementById('result-screen').classList.remove('hidden');
    const container = document.getElementById('diagram-container');
    container.innerHTML = '';
    results.forEach(q => {
        const circle = document.createElement('div');
        circle.className = `circle ${q.attempts === 1 ? 'green' : q.attempts === 2 ? 'yellow' : 'red'}`;
        container.appendChild(circle);
    });
}