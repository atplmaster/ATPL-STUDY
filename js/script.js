// ========================================
// ATPL STUDY PLATFORM
// COMPLETE VERSION
// ========================================


// ========================================
// GLOBAL VARIABLES
// ========================================

let questions = [];
let current = 0;
let status = [];
let quizMode = false;
let markedQuestionIds = new Set();


// ========================================
// SUBJECTS
// ========================================

const subjectNames = {
    meteorology: "Meteorology",
    airlaw: "Air Law",
    operational: "Operational Procedures"
};

const subjectFiles = [
    "meteorology",
    "airlaw",
    "operational"
];


// ========================================
// SCREEN CONTROL
// ========================================

function showOnly(screenId) {

    const screens = [
        "loginScreen",
        "accessRequestScreen",
        "homeScreen",
        "adminScreen",
        "practiceSetup",
        "quizSetup",
        "combinedQuizSetup",
        "searchScreen",
        "markedScreen",
        "quizScreen",
        "resultsScreen"
    ];

    screens.forEach(function(id) {

        const element =
            document.getElementById(id);

        if (element) {
            element.style.display = "none";
        }

    });

    const selected =
        document.getElementById(screenId);

    if (selected) {
        selected.style.display = "block";
    }

}


// ========================================
// PRACTICE BUTTON
// ========================================

document.getElementById("practiceBtn").onclick =
function() {

    showOnly("practiceSetup");

};


// ========================================
// START PRACTICE
// ========================================

document.getElementById("startPracticeBtn").onclick =
function() {

    quizMode = false;

    const subjectFile =
        document.getElementById(
            "practiceSubjectSelect"
        ).value;

    showOnly("quizScreen");

    loadPracticeQuestions(
        subjectFile
    );

};


// ========================================
// PRACTICE BACK
// ========================================

document.getElementById("practiceBackBtn").onclick =
function() {

    showOnly("homeScreen");

};


// ========================================
// SUBJECT QUIZ
// ========================================

document.getElementById("subjectQuizBtn").onclick =
function() {

    showOnly("quizSetup");

};


// ========================================
// START SUBJECT QUIZ
// ========================================

document.getElementById("startQuizBtn").onclick =
function() {

    quizMode = true;

    const subjectFile =
        document.getElementById(
            "subjectSelect"
        ).value;

    const numberOfQuestions =
        document.getElementById(
            "questionCount"
        ).value;

    showOnly("quizScreen");

    loadSubjectQuiz(
        subjectFile,
        numberOfQuestions
    );

};


// ========================================
// SUBJECT QUIZ BACK
// ========================================

document.getElementById("backHomeBtn").onclick =
function() {

    showOnly("homeScreen");

};


// ========================================
// COMBINED QUIZ
// ========================================

document.getElementById("combinedQuizBtn").onclick =
function() {

    showOnly("combinedQuizSetup");

    loadCombinedQuestionCount();

};


// ========================================
// COMBINED BACK
// ========================================

document.getElementById("combinedBackBtn").onclick =
function() {

    showOnly("homeScreen");

};


// ========================================
// LOAD COMBINED QUESTION COUNT
// ========================================

async function loadCombinedQuestionCount() {

    let totalQuestions = 0;

    try {

        for (const file of subjectFiles) {

            const response =
                await fetch(
                    "data/" +
                    file +
                    ".json"
                );

            if (!response.ok) {

                throw new Error(
                    "Unable to load " +
                    file +
                    ".json"
                );

            }

            const data =
                await response.json();

            totalQuestions +=
                data.length;

        }

        document.getElementById(
            "availableQuestions"
        ).innerHTML =
            "Available questions: <strong>" +
            totalQuestions +
            "</strong>";

        updateCombinedQuestionOptions(
            totalQuestions
        );

    } catch (error) {

        console.error(
            "Combined question count error:",
            error
        );

        document.getElementById(
            "availableQuestions"
        ).innerHTML =
            "Unable to load questions.";

    }

}


// ========================================
// UPDATE COMBINED OPTIONS
// ========================================

function updateCombinedQuestionOptions(
    totalQuestions
) {

    const select =
        document.getElementById(
            "combinedQuestionCount"
        );

    if (!select) {
        return;
    }

    select.querySelectorAll("option")
        .forEach(function(option) {

            if (option.value === "all") {
                return;
            }

            const number =
                parseInt(
                    option.value,
                    10
                );

            option.disabled =
                number > totalQuestions;

        });

}


// ========================================
// START COMBINED QUIZ
// ========================================

document.getElementById(
    "startCombinedBtn"
).onclick =
function() {

    const questionCount =
        document.getElementById(
            "combinedQuestionCount"
        ).value;

    loadCombinedQuiz(
        questionCount
    );

};


// ========================================
// LOAD PRACTICE QUESTIONS
// ========================================

async function loadPracticeQuestions(
    subjectFile
) {

    try {

        const response =
            await fetch(
                "data/" +
                subjectFile +
                ".json"
            );

        if (!response.ok) {

            throw new Error(
                "Unable to load " +
                subjectFile +
                ".json"
            );

        }

        questions =
            await response.json();

        questions.forEach(function(question) {

            question.subject =
                subjectFile;

        });

        status =
            new Array(
                questions.length
            ).fill(
                "notAttempted"
            );

        current = 0;

        document.getElementById(
            "subject"
        ).innerHTML =
            subjectNames[
                subjectFile
            ];

        await loadMarkedQuestions();

        createNavigator();

        showQuestion();

        await loadSavedProgress(
            subjectFile
        );

    } catch (error) {

        console.error(
            "Practice loading error:",
            error
        );

        alert(
            "Error loading " +
            subjectNames[
                subjectFile
            ] +
            " questions."
        );

    }

}


// ========================================
// LOAD SUBJECT QUIZ
// ========================================

async function loadSubjectQuiz(
    subjectFile,
    numberOfQuestions
) {

    try {

        const response =
            await fetch(
                "data/" +
                subjectFile +
                ".json"
            );

        if (!response.ok) {

            throw new Error(
                "Unable to load " +
                subjectFile +
                ".json"
            );

        }

        let allQuestions =
            await response.json();

        allQuestions.forEach(
            function(question) {

                question.subject =
                    subjectFile;

            }
        );

        allQuestions.sort(
            function() {

                return Math.random() - 0.5;

            }
        );

        if (
            numberOfQuestions === "all"
        ) {

            questions =
                allQuestions;

        } else {

            questions =
                allQuestions.slice(
                    0,
                    parseInt(
                        numberOfQuestions,
                        10
                    )
                );

        }

        status =
            new Array(
                questions.length
            ).fill(
                "notAttempted"
            );

        current = 0;

        document.getElementById(
            "subject"
        ).innerHTML =
            subjectNames[
                subjectFile
            ] +
            " QUIZ";

        await loadMarkedQuestions();

        createNavigator();

        showQuestion();

    } catch (error) {

        console.error(
            "Subject quiz loading error:",
            error
        );

        alert(
            "Error loading " +
            subjectNames[
                subjectFile
            ] +
            " quiz."
        );

    }

}


// ========================================
// LOAD COMBINED QUIZ
// ========================================

async function loadCombinedQuiz(
    questionCount
) {

    const combinedQuestions = [];

    try {

        for (const file of subjectFiles) {

            const response =
                await fetch(
                    "data/" +
                    file +
                    ".json"
                );

            if (!response.ok) {

                throw new Error(
                    "Unable to load " +
                    file +
                    ".json"
                );

            }

            const data =
                await response.json();

            data.forEach(
                function(question) {

                    question.subject =
                        file;

                    combinedQuestions.push(
                        question
                    );

                }
            );

        }

        combinedQuestions.sort(
            function() {

                return Math.random() - 0.5;

            }
        );

        if (
            questionCount === "all"
        ) {

            questions =
                combinedQuestions;

        } else {

            questions =
                combinedQuestions.slice(
                    0,
                    parseInt(
                        questionCount,
                        10
                    )
                );

        }

        status =
            new Array(
                questions.length
            ).fill(
                "notAttempted"
            );

        current = 0;

        quizMode = true;

        showOnly("quizScreen");

        document.getElementById(
            "subject"
        ).innerHTML =
            "COMBINED ATPL QUIZ";

        await loadMarkedQuestions();

        createNavigator();

        showQuestion();

    } catch (error) {

        console.error(
            "Combined quiz error:",
            error
        );

        alert(
            "Error loading combined quiz."
        );

    }

}


// ========================================
// CREATE QUESTION NAVIGATOR
// ========================================

function createNavigator() {

    const nav =
        document.getElementById(
            "navigator"
        );

    if (!nav) {
        return;
    }

    nav.innerHTML = "";

    questions.forEach(
        function(question, index) {

            const button =
                document.createElement(
                    "button"
                );

            button.innerHTML =
                index + 1;

            button.className =
                "navButton " +
                status[index];

            button.onclick =
                function() {

                    current =
                        index;

                    showQuestion();

                };

            nav.appendChild(
                button
            );

        }
    );

}


// ========================================
// SHOW QUESTION
// ========================================

function showQuestion() {

    if (!questions.length) {
        return;
    }

    const question =
        questions[current];

    document.getElementById(
        "counter"
    ).innerHTML =
        "Question " +
        (current + 1) +
        " of " +
        questions.length;


    if (
        question.subject &&
        subjectNames[
            question.subject
        ]
    ) {

        if (!quizMode) {

            document.getElementById(
                "subject"
            ).innerHTML =
                subjectNames[
                    question.subject
                ];

        }

    }


    document.getElementById(
        "question"
    ).innerHTML =
        question.question;


    const questionImages =
        document.getElementById(
            "questionImages"
        );

    questionImages.innerHTML = "";


    if (
        question.images &&
        Array.isArray(
            question.images
        ) &&
        question.images.length
    ) {

        question.images.forEach(
            function(src) {

                const img =
                    document.createElement(
                        "img"
                    );

                img.src = src;

                img.alt =
                    "Question figure";

                img.className =
                    "question-figure";

                img.loading =
                    "lazy";

                img.onerror =
                    function() {

                        console.error(
                            "Image failed to load:",
                            src
                        );

                    };

                img.onclick =
                    function() {

                        window.open(
                            src,
                            "_blank"
                        );

                    };

                questionImages.appendChild(
                    img
                );

            }
        );

        questionImages.style.display =
            "flex";

    } else {

        questionImages.style.display =
            "none";

    }


    updateMarkButton();


    const answers =
        document.getElementById(
            "answers"
        );

    answers.innerHTML = "";


    if (
        !question.options ||
        !Array.isArray(
            question.options
        )
    ) {

        answers.innerHTML =
            "<p>Question options are missing.</p>";

        return;

    }


    question.options.forEach(
        function(option, index) {

            const button =
                document.createElement(
                    "button"
                );

            button.className =
                "option";

            button.innerHTML =
                option;


            if (
                status[current] ===
                "correct"
            ) {

                if (
                    index ===
                    question.answer
                ) {

                    button.classList.add(
                        "correct"
                    );

                }

            }


            if (
                status[current] ===
                "wrong"
            ) {

                if (
                    index ===
                    question.answer
                ) {

                    button.classList.add(
                        "correct"
                    );

                }

            }


            button.onclick =
                async function() {

                    if (
                        status[current] ===
                        "correct" ||
                        status[current] ===
                        "wrong"
                    ) {

                        return;

                    }


                    let questionStatus;


                    if (
                        index ===
                        question.answer
                    ) {

                        button.classList.add(
                            "correct"
                        );

                        status[current] =
                            "correct";

                        questionStatus =
                            "correct";

                    } else {

                        button.classList.add(
                            "wrong"
                        );

                        status[current] =
                            "wrong";

                        questionStatus =
                            "wrong";


                        const allButtons =
                            answers.querySelectorAll(
                                ".option"
                            );

                        if (
                            allButtons[
                                question.answer
                            ]
                        ) {

                            allButtons[
                                question.answer
                            ].classList.add(
                                "correct"
                            );

                        }

                    }


                    await saveProgress(
                        question,
                        current,
                        questionStatus
                    );

                    createNavigator();

                };


            answers.appendChild(
                button
            );

        }
    );

}


// ========================================
// MARK QUESTION BUTTON
// ========================================

document.getElementById(
    "markQuestionBtn"
).onclick =
async function() {

    await toggleMarkQuestion();

};


// ========================================
// TOGGLE MARK
// ========================================

async function toggleMarkQuestion() {

    if (!questions.length) {
        return;
    }

    const question =
        questions[current];


    if (!question.id) {

        alert(
            "This question does not have an ID."
        );

        return;

    }


    try {

        const {
            data: {
                user
            }
        } =
            await supabaseClient.auth.getUser();


        if (!user) {

            alert(
                "Please log in first."
            );

            return;

        }


        const alreadyMarked =
            markedQuestionIds.has(
                String(question.id)
            );


        if (alreadyMarked) {

            const {
                error
            } =
                await supabaseClient
                    .from(
                        "marked_questions"
                    )
                    .delete()
                    .eq(
                        "user_id",
                        user.id
                    )
                    .eq(
                        "question_id",
                        question.id
                    );


            if (error) {

                console.error(
                    "Unmark error:",
                    error
                );

                alert(
                    "Unable to unmark question."
                );

                return;

            }


            markedQuestionIds.delete(
                String(question.id)
            );

        } else {

            const {
                error
            } =
                await supabaseClient
                    .from(
                        "marked_questions"
                    )
                    .insert({

                        user_id:
                            user.id,

                        question_id:
                            question.id,

                        subject:
                            question.subject,

                        marked_at:
                            new Date()
                                .toISOString()

                    });


            if (error) {

                console.error(
                    "Mark error:",
                    error
                );

                alert(
                    "Unable to mark question: " +
                    error.message
                );

                return;

            }


            markedQuestionIds.add(
                String(question.id)
            );

        }


        updateMarkButton();

    } catch (error) {

        console.error(
            "Unexpected marking error:",
            error
        );

    }

}


// ========================================
// UPDATE MARK BUTTON
// ========================================

function updateMarkButton() {

    const button =
        document.getElementById(
            "markQuestionBtn"
        );

    if (
        !button ||
        !questions.length
    ) {

        return;

    }


    const question =
        questions[current];


    if (
        markedQuestionIds.has(
            String(question.id)
        )
    ) {

        button.innerHTML =
            "⭐ Unmark Question";

        button.classList.add(
            "marked"
        );

    } else {

        button.innerHTML =
            "⭐ Mark Question";

        button.classList.remove(
            "marked"
        );

    }

}


// ========================================
// LOAD MARKED QUESTIONS
// ========================================

async function loadMarkedQuestions() {

    markedQuestionIds =
        new Set();


    try {

        const {
            data: {
                user
            }
        } =
            await supabaseClient.auth.getUser();


        if (!user) {
            return;
        }


        const {
            data,
            error
        } =
            await supabaseClient
                .from(
                    "marked_questions"
                )
                .select(
                    "question_id"
                )
                .eq(
                    "user_id",
                    user.id
                );


        if (error) {

            console.error(
                "Load marked questions error:",
                error
            );

            return;

        }


        if (data) {

            data.forEach(
                function(record) {

                    markedQuestionIds.add(
                        String(
                            record.question_id
                        )
                    );

                }
            );

        }

    } catch (error) {

        console.error(
            "Unexpected marked loading error:",
            error
        );

    }

}


// ========================================
// MARKED QUESTIONS BUTTON
// ========================================

document.getElementById(
    "markedBtn"
).onclick =
async function() {

    showOnly(
        "markedScreen"
    );

    await displayMarkedQuestions();

};


// ========================================
// DISPLAY MARKED QUESTIONS
// ========================================

async function displayMarkedQuestions() {

    const container =
        document.getElementById(
            "markedQuestionsList"
        );


    container.innerHTML =
        "Loading marked questions...";


    try {

        const {
            data: {
                user
            }
        } =
            await supabaseClient.auth.getUser();


        if (!user) {

            container.innerHTML =
                "Please log in.";

            return;

        }


        const {
            data,
            error
        } =
            await supabaseClient
                .from(
                    "marked_questions"
                )
                .select(
                    "question_id,subject,marked_at"
                )
                .eq(
                    "user_id",
                    user.id
                )
                .order(
                    "marked_at",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                "Marked list error:",
                error
            );

            container.innerHTML =
                "Unable to load marked questions.";

            return;

        }


        if (
            !data ||
            data.length === 0
        ) {

            container.innerHTML =
                "<p>You have no marked questions.</p>";

            return;

        }


        const allQuestions = [];


        for (
            const subjectFile
            of subjectFiles
        ) {

            const response =
                await fetch(
                    "data/" +
                    subjectFile +
                    ".json"
                );

            if (!response.ok) {
                continue;
            }


            const subjectQuestions =
                await response.json();


            subjectQuestions.forEach(
                function(question) {

                    question.subject =
                        subjectFile;

                    allQuestions.push(
                        question
                    );

                }
            );

        }


        container.innerHTML = "";


        data.forEach(
            function(marked) {

                const question =
                    allQuestions.find(
                        function(q) {

                            return String(
                                q.id
                            ) ===
                            String(
                                marked.question_id
                            );

                        }
                    );


                const box =
                    document.createElement(
                        "div"
                    );


                box.style.border =
                    "1px solid #ccc";

                box.style.padding =
                    "15px";

                box.style.marginBottom =
                    "10px";

                box.style.borderRadius =
                    "8px";


                if (question) {

                    box.innerHTML =
                        "<strong>" +
                        escapeHTML(
                            subjectNames[
                                question.subject
                            ]
                        ) +
                        "</strong>" +
                        "<br><br>" +
                        "<strong>Question:</strong><br>" +
                        escapeHTML(
                            question.question
                        ) +
                        "<br><br>" +
                        "<strong>Question ID:</strong> " +
                        escapeHTML(
                            question.id
                        );


                    const openButton =
                        document.createElement(
                            "button"
                        );


                    openButton.innerHTML =
                        "Open Question";

                    openButton.className =
                        "modeButton";


                    openButton.onclick =
                        function() {

                            questions = [
                                question
                            ];

                            status = [
                                "notAttempted"
                            ];

                            current = 0;

                            quizMode = false;

                            showOnly(
                                "quizScreen"
                            );


                            loadMarkedQuestions()
                                .then(
                                    function() {

                                        document.getElementById(
                                            "subject"
                                        ).innerHTML =
                                            subjectNames[
                                                question.subject
                                            ];

                                        createNavigator();

                                        showQuestion();

                                    }
                                );

                        };


                    const unmarkButton =
                        document.createElement(
                            "button"
                        );


                    unmarkButton.innerHTML =
                        "Unmark";

                    unmarkButton.className =
                        "backButton";


                    unmarkButton.onclick =
                        async function() {

                            await unmarkById(
                                marked.question_id
                            );

                            await displayMarkedQuestions();

                        };


                    box.appendChild(
                        document.createElement(
                            "br"
                        )
                    );


                    box.appendChild(
                        openButton
                    );

                    box.appendChild(
                        unmarkButton
                    );


                } else {

                    box.innerHTML =
                        "<strong>Question not found</strong>" +
                        "<br>" +
                        "Question ID: " +
                        escapeHTML(
                            marked.question_id
                        );

                }


                container.appendChild(
                    box
                );

            }
        );


    } catch (error) {

        console.error(
            "Unexpected marked list error:",
            error
        );

        container.innerHTML =
            "Unable to load marked questions.";

    }

}


// ========================================
// UNMARK FROM MARKED LIST
// ========================================

async function unmarkById(
    questionId
) {

    try {

        const {
            data: {
                user
            }
        } =
            await supabaseClient.auth.getUser();


        if (!user) {
            return;
        }


        const {
            error
        } =
            await supabaseClient
                .from(
                    "marked_questions"
                )
                .delete()
                .eq(
                    "user_id",
                    user.id
                )
                .eq(
                    "question_id",
                    questionId
                );


        if (error) {

            console.error(
                "Unmark error:",
                error
            );

            return;

        }


        markedQuestionIds.delete(
            String(questionId)
        );


    } catch (error) {

        console.error(
            "Unexpected unmark error:",
            error
        );

    }

}


// ========================================
// SEARCH BUTTON
// ========================================

document.getElementById(
    "searchBtn"
).onclick =
function() {

    showOnly(
        "searchScreen"
    );

};


// ========================================
// SEARCH QUESTIONS
// ========================================

document.getElementById(
    "searchQuestionsBtn"
).onclick =
async function() {

    await searchQuestions();

};


// ========================================
// SEARCH QUESTIONS FUNCTION
// ========================================

async function searchQuestions() {

    const searchText =
        document.getElementById(
            "searchInput"
        ).value
        .trim()
        .toLowerCase();


    const selectedSubject =
        document.getElementById(
            "searchSubject"
        ).value;


    const results =
        document.getElementById(
            "searchResults"
        );


    results.innerHTML =
        "Searching...";


    try {

        const allQuestions = [];


        for (
            const subjectFile
            of subjectFiles
        ) {

            if (
                selectedSubject !== "all" &&
                selectedSubject !== subjectFile
            ) {

                continue;

            }


            const response =
                await fetch(
                    "data/" +
                    subjectFile +
                    ".json"
                );


            if (!response.ok) {

                console.error(
                    "Could not load:",
                    subjectFile
                );

                continue;

            }


            const data =
                await response.json();


            data.forEach(
                function(question) {

                    question.subject =
                        subjectFile;

                    allQuestions.push(
                        question
                    );

                }
            );

        }


        const filtered =
            allQuestions.filter(
                function(question) {

                    if (!searchText) {
                        return true;
                    }


                    const questionText =
                        String(
                            question.question ||
                            ""
                        ).toLowerCase();


                    const optionsText =
                        Array.isArray(
                            question.options
                        )
                            ?
                            question.options
                                .join(" ")
                                .toLowerCase()
                            :
                            "";


                    return (
                        questionText.includes(
                            searchText
                        ) ||
                        optionsText.includes(
                            searchText
                        )
                    );

                }
            );


        if (
            filtered.length === 0
        ) {

            results.innerHTML =
                "<p>No questions found.</p>";

            return;

        }


        results.innerHTML =
            "<p><strong>" +
            filtered.length +
            "</strong> questions found.</p>";


        filtered.forEach(
            function(question) {

                const box =
                    document.createElement(
                        "div"
                    );


                box.style.border =
                    "1px solid #ccc";

                box.style.padding =
                    "15px";

                box.style.marginBottom =
                    "10px";

                box.style.borderRadius =
                    "8px";


                box.innerHTML =
                    "<strong>" +
                    escapeHTML(
                        subjectNames[
                            question.subject
                        ]
                    ) +
                    "</strong>" +
                    "<br><br>" +
                    escapeHTML(
                        question.question
                    );


                const openButton =
                    document.createElement(
                        "button"
                    );


                openButton.innerHTML =
                    "Open Question";

                openButton.className =
                    "modeButton";


                openButton.onclick =
                    function() {

                        questions = [
                            question
                        ];

                        status = [
                            "notAttempted"
                        ];

                        current = 0;

                        quizMode = false;

                        showOnly(
                            "quizScreen"
                        );


                        loadMarkedQuestions()
                            .then(
                                function() {

                                    document.getElementById(
                                        "subject"
                                    ).innerHTML =
                                        subjectNames[
                                            question.subject
                                        ];

                                    createNavigator();

                                    showQuestion();

                                }
                            );

                    };


                box.appendChild(
                    document.createElement(
                        "br"
                    )
                );


                box.appendChild(
                    openButton
                );


                results.appendChild(
                    box
                );

            }
        );


    } catch (error) {

        console.error(
            "Search error:",
            error
        );

        results.innerHTML =
            "Unable to search questions.";

    }

}


// ========================================
// SEARCH BACK
// ========================================

document.getElementById(
    "searchBackBtn"
).onclick =
function() {

    showOnly(
        "homeScreen"
    );

};


// ========================================
// MARKED BACK
// ========================================

document.getElementById(
    "markedBackBtn"
).onclick =
function() {

    showOnly(
        "homeScreen"
    );

};


// ========================================
// NEXT BUTTON
// ========================================

document.getElementById(
    "nextBtn"
).onclick =
function() {

    if (
        current <
        questions.length - 1
    ) {

        current++;

        showQuestion();

    } else {

        if (quizMode) {

            showResults();

        }

    }

};


// ========================================
// PREVIOUS BUTTON
// ========================================

document.getElementById(
    "prevBtn"
).onclick =
function() {

    if (
        current > 0
    ) {

        current--;

        showQuestion();

    }

};


// ========================================
// SKIP BUTTON
// ========================================

document.getElementById(
    "skipBtn"
).onclick =
async function() {

    if (!questions.length) {
        return;
    }


    status[current] =
        "skipped";


    await saveProgress(
        questions[current],
        current,
        "skipped"
    );


    if (
        current <
        questions.length - 1
    ) {

        current++;

        showQuestion();

    }


    createNavigator();

};


// ========================================
// BACK TO MENU
// ========================================

document.getElementById(
    "questionBackBtn"
).onclick =
function() {

    showOnly(
        "homeScreen"
    );

    checkAdminAccess();

};


// ========================================
// SHOW RESULTS
// ========================================

function showResults() {

    let correct = 0;
    let wrong = 0;
    let skipped = 0;


    status.forEach(
        function(result) {

            if (
                result === "correct"
            ) {
                correct++;
            }

            if (
                result === "wrong"
            ) {
                wrong++;
            }

            if (
                result === "skipped"
            ) {
                skipped++;
            }

        }
    );


    const total =
        questions.length;


    const percentage =
        total > 0
            ?
            Math.round(
                (
                    correct /
                    total
                ) *
                100
            )
            :
            0;


    showOnly(
        "resultsScreen"
    );


    document.getElementById(
        "resultScore"
    ).innerHTML =
        "<h1>" +
        percentage +
        "%</h1>";


    document.getElementById(
        "resultDetails"
    ).innerHTML =
        "<p>Correct: " +
        correct +
        "</p>" +
        "<p>Wrong: " +
        wrong +
        "</p>" +
        "<p>Skipped: " +
        skipped +
        "</p>" +
        "<p>Total Questions: " +
        total +
        "</p>";

}


// ========================================
// REVIEW ANSWERS
// ========================================

document.getElementById(
    "reviewBtn"
).onclick =
function() {

    current = 0;

    showOnly(
        "quizScreen"
    );

    showQuestion();

};


// ========================================
// RESULTS HOME
// ========================================

document.getElementById(
    "resultsHomeBtn"
).onclick =
function() {

    showOnly(
        "homeScreen"
    );

    checkAdminAccess();

};


// ========================================
// CREATE ACCOUNT
// ========================================

document.getElementById(
    "signupBtn"
).onclick =
async function() {

    const email =
        document.getElementById(
            "loginEmail"
        ).value.trim();


    const password =
        document.getElementById(
            "loginPassword"
        ).value;


    const message =
        document.getElementById(
            "loginMessage"
        );


    if (
        !email ||
        !password
    ) {

        message.innerHTML =
            "Please enter your email and password.";

        return;

    }


    if (
        password.length < 6
    ) {

        message.innerHTML =
            "Password must be at least 6 characters.";

        return;

    }


    message.innerHTML =
        "Creating account...";


    try {

        const {
            error
        } =
            await supabaseClient.auth.signUp({

                email:
                    email,

                password:
                    password

            });


        if (error) {

            console.error(
                "Signup error:",
                error
            );

            message.innerHTML =
                error.message;

            return;

        }


        message.innerHTML =
            "Account created successfully. You can now log in.";


    } catch (error) {

        console.error(
            "Unexpected signup error:",
            error
        );

        message.innerHTML =
            "Unable to create account.";

    }

};


// ========================================
// LOGIN
// ========================================

document.getElementById(
    "loginBtn"
).onclick =
async function() {

    const email =
        document.getElementById(
            "loginEmail"
        ).value.trim();


    const password =
        document.getElementById(
            "loginPassword"
        ).value;


    const message =
        document.getElementById(
            "loginMessage"
        );


    if (
        !email ||
        !password
    ) {

        message.innerHTML =
            "Please enter your email and password.";

        return;

    }


    message.innerHTML =
        "Logging in...";


    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth
                .signInWithPassword({

                    email:
                        email,

                    password:
                        password

                });


        if (error) {

            console.error(
                "Login error:",
                error
            );

            message.innerHTML =
                error.message;

            return;

        }


        if (
            !data ||
            !data.user
        ) {

            message.innerHTML =
                "Login failed.";

            return;

        }


        const {
            data: approvedUser,
            error: approvalError
        } =
            await supabaseClient
                .from(
                    "approved_users"
                )
                .select(
                    "email"
                )
                .eq(
                    "email",
                    email
                )
                .maybeSingle();


        if (approvalError) {

            console.error(
                "Approval check error:",
                approvalError
            );

            await supabaseClient.auth.signOut();

            message.innerHTML =
                "Unable to verify account approval.";

            return;

        }


        if (!approvedUser) {

            await supabaseClient.auth.signOut();

            message.innerHTML =
                "Your account has not been approved yet. Please request access.";

            return;

        }


        message.innerHTML =
            "Login successful.";


        showOnly(
            "homeScreen"
        );


        await checkAdminAccess();


    } catch (error) {

        console.error(
            "Unexpected login error:",
            error
        );

        message.innerHTML =
            "Login failed. Please try again.";

    }

};


// ========================================
// SAVE PROGRESS
// ========================================

async function saveProgress(
    question,
    questionIndex,
    questionStatus
) {

    try {

        const {
            data: {
                user
            }
        } =
            await supabaseClient.auth.getUser();


        if (!user) {
            return;
        }


        if (!question.id) {

            console.error(
                "Question has no ID:",
                question
            );

            return;

        }


        const questionId =
            question.id;


        const subject =
            question.subject ||
            "unknown";


        const {
            data: existing,
            error: findError
        } =
            await supabaseClient
                .from(
                    "progress"
                )
                .select(
                    "id"
                )
                .eq(
                    "user_id",
                    user.id
                )
                .eq(
                    "question_id",
                    questionId
                )
                .maybeSingle();


        if (findError) {

            console.error(
                "Progress lookup error:",
                findError
            );

            return;

        }


        if (existing) {

            const {
                error
            } =
                await supabaseClient
                    .from(
                        "progress"
                    )
                    .update({

                        subject:
                            subject,

                        question_index:
                            questionIndex,

                        status:
                            questionStatus,

                        updated_at:
                            new Date()
                                .toISOString()

                    })
                    .eq(
                        "id",
                        existing.id
                    );


            if (error) {

                console.error(
                    "Progress update error:",
                    error
                );

            }

        } else {

            const {
                error
            } =
                await supabaseClient
                    .from(
                        "progress"
                    )
                    .insert({

                        user_id:
                            user.id,

                        question_id:
                            questionId,

                        subject:
                            subject,

                        question_index:
                            questionIndex,

                        status:
                            questionStatus

                    });


            if (error) {

                console.error(
                    "Progress insert error:",
                    error
                );

            }

        }


    } catch (error) {

        console.error(
            "Unexpected progress error:",
            error
        );

    }

}


// ========================================
// LOAD SAVED PROGRESS
// ========================================

async function loadSavedProgress(
    subject
) {

    try {

        const {
            data: {
                user
            }
        } =
            await supabaseClient.auth.getUser();


        if (!user) {
            return;
        }


        const {
            data,
            error
        } =
            await supabaseClient
                .from(
                    "progress"
                )
                .select(
                    "question_id,status"
                )
                .eq(
                    "user_id",
                    user.id
                )
                .eq(
                    "subject",
                    subject
                );


        if (error) {

            console.error(
                "Progress loading error:",
                error
            );

            return;

        }


        if (data) {

            data.forEach(
                function(record) {

                    const index =
                        questions.findIndex(
                            function(question) {

                                return (
                                    String(
                                        question.id
                                    ) ===
                                    String(
                                        record.question_id
                                    )
                                );

                            }
                        );


                    if (
                        index !== -1
                    ) {

                        status[index] =
                            record.status;

                    }

                }
            );

        }


        createNavigator();


    } catch (error) {

        console.error(
            "Unexpected progress loading error:",
            error
        );

    }

}


// ========================================
// RESET SUBJECT PROGRESS
// ========================================

async function resetSubjectProgress(
    subjectFile
) {

    const subjectName =
        subjectNames[
            subjectFile
        ];


    const confirmed =
        confirm(
            "Are you sure you want to reset all your " +
            subjectName +
            " progress?\n\n" +
            "This will remove Correct, Wrong and Skipped progress for this subject.\n\n" +
            "Your marked questions will NOT be deleted."
        );


    if (!confirmed) {
        return;
    }


    const message =
        document.getElementById(
            "resetMessage"
        );


    if (message) {

        message.innerHTML =
            "Resetting " +
            subjectName +
            " progress...";

    }


    try {

        const {
            data: {
                user
            },
            error: userError
        } =
            await supabaseClient.auth.getUser();


        if (
            userError ||
            !user
        ) {

            if (message) {

                message.innerHTML =
                    "Please log in first.";

            }

            return;

        }


        const {
            error
        } =
            await supabaseClient
                .from(
                    "progress"
                )
                .delete()
                .eq(
                    "user_id",
                    user.id
                )
                .eq(
                    "subject",
                    subjectFile
                );


        if (error) {

            console.error(
                "Reset progress error:",
                error
            );

            if (message) {

                message.innerHTML =
                    "Unable to reset progress: " +
                    error.message;

            }

            return;

        }


        /*
         * If the current question list belongs
         * entirely to this subject, reset the
         * displayed progress as well.
         */

        if (
            questions.length > 0 &&
            questions.every(
                function(question) {

                    return (
                        question.subject ===
                        subjectFile
                    );

                }
            )
        ) {

            status =
                new Array(
                    questions.length
                ).fill(
                    "notAttempted"
                );

            current = 0;

            createNavigator();

            showQuestion();

        }


        if (message) {

            message.innerHTML =
                "✅ " +
                subjectName +
                " progress has been reset.";

        }


        console.log(
            subjectName +
            " progress reset successfully."
        );


    } catch (error) {

        console.error(
            "Unexpected reset error:",
            error
        );


        if (message) {

            message.innerHTML =
                "Unable to reset progress.";

        }

    }

}


// ========================================
// RESET METEOROLOGY BUTTON
// ========================================

document.getElementById(
    "resetMeteorologyBtn"
).onclick =
async function() {

    await resetSubjectProgress(
        "meteorology"
    );

};


// ========================================
// RESET AIR LAW BUTTON
// ========================================

document.getElementById(
    "resetAirlawBtn"
).onclick =
async function() {

    await resetSubjectProgress(
        "airlaw"
    );

};


// ========================================
// RESET OPERATIONAL PROCEDURES BUTTON
// ========================================

document.getElementById(
    "resetOperationalBtn"
).onclick =
async function() {

    await resetSubjectProgress(
        "operational"
    );

};


// ========================================
// REQUEST ACCESS
// ========================================

document.getElementById(
    "requestAccessBtn"
).onclick =
function() {

    showOnly(
        "accessRequestScreen"
    );

};


// ========================================
// BACK TO LOGIN
// ========================================

document.getElementById(
    "backToLoginBtn"
).onclick =
function() {

    showOnly(
        "loginScreen"
    );

};


// ========================================
// SUBMIT ACCESS REQUEST
// ========================================

document.getElementById(
    "submitAccessRequestBtn"
).onclick =
async function() {

    const name =
        document.getElementById(
            "requestName"
        ).value.trim();


    const email =
        document.getElementById(
            "requestEmail"
        ).value.trim();


    const reason =
        document.getElementById(
            "requestReason"
        ).value.trim();


    const message =
        document.getElementById(
            "accessRequestMessage"
        );


    if (
        !name ||
        !email
    ) {

        message.innerHTML =
            "Please enter your name and email.";

        return;

    }


    message.innerHTML =
        "Submitting request...";


    try {

        const {
            error
        } =
            await supabaseClient
                .from(
                    "access_requests"
                )
                .insert({

                    name:
                        name,

                    email:
                        email,

                    reason:
                        reason

                });


        if (error) {

            console.error(
                "Access request error:",
                error
            );

            message.innerHTML =
                "Unable to submit request. Please try again.";

            return;

        }


        message.innerHTML =
            "Request submitted successfully. Your access will be reviewed.";


        document.getElementById(
            "requestName"
        ).value = "";


        document.getElementById(
            "requestEmail"
        ).value = "";


        document.getElementById(
            "requestReason"
        ).value = "";


    } catch (error) {

        console.error(
            "Unexpected request error:",
            error
        );

        message.innerHTML =
            "Unable to submit request. Please try again.";

    }

};


// ========================================
// CHECK ADMIN ACCESS
// ========================================

async function checkAdminAccess() {

    const adminButton =
        document.getElementById(
            "adminBtn"
        );


    if (!adminButton) {
        return;
    }


    adminButton.style.display =
        "none";


    try {

        const {
            data: {
                user
            },
            error
        } =
            await supabaseClient.auth.getUser();


        if (
            error ||
            !user
        ) {

            return;

        }


        const {
            data: adminUser,
            error: adminError
        } =
            await supabaseClient
                .from(
                    "admin_users"
                )
                .select(
                    "email"
                )
                .eq(
                    "email",
                    user.email
                )
                .maybeSingle();


        if (adminError) {

            console.error(
                "Admin check error:",
                adminError
            );

            return;

        }


        if (adminUser) {

            adminButton.style.display =
                "block";

        }


    } catch (error) {

        console.error(
            "Unexpected admin check error:",
            error
        );

    }

}


// ========================================
// OPEN ADMIN DASHBOARD
// ========================================

document.getElementById(
    "adminBtn"
).onclick =
async function() {

    showOnly(
        "adminScreen"
    );

    await loadAdminRequests();

    await loadApprovedUsers();

};


// ========================================
// ADMIN BACK
// ========================================

document.getElementById(
    "adminBackBtn"
).onclick =
function() {

    showOnly(
        "homeScreen"
    );

    checkAdminAccess();

};


// ========================================
// LOAD ACCESS REQUESTS
// ========================================

async function loadAdminRequests() {

    const container =
        document.getElementById(
            "adminRequests"
        );


    container.innerHTML =
        "Loading requests...";


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from(
                    "access_requests"
                )
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                "Admin requests error:",
                error
            );

            container.innerHTML =
                "Unable to load access requests.";

            return;

        }


        if (
            !data ||
            data.length === 0
        ) {

            container.innerHTML =
                "No access requests.";

            return;

        }


        container.innerHTML = "";


        data.forEach(
            function(request) {

                const box =
                    document.createElement(
                        "div"
                    );


                box.style.border =
                    "1px solid #ccc";

                box.style.padding =
                    "15px";

                box.style.marginBottom =
                    "10px";

                box.style.borderRadius =
                    "8px";


                box.innerHTML =
                    "<strong>Name:</strong> " +
                    escapeHTML(
                        request.name
                    ) +
                    "<br>" +
                    "<strong>Email:</strong> " +
                    escapeHTML(
                        request.email
                    ) +
                    "<br>" +
                    "<strong>Reason:</strong> " +
                    escapeHTML(
                        request.reason ||
                        "Not provided"
                    ) +
                    "<br>" +
                    "<strong>Date:</strong> " +
                    new Date(
                        request.created_at
                    ).toLocaleString() +
                    "<br><br>";


                const approveButton =
                    document.createElement(
                        "button"
                    );


                approveButton.innerHTML =
                    "Approve";

                approveButton.className =
                    "modeButton";


                approveButton.onclick =
                    function() {

                        approveUser(
                            request
                        );

                    };


                const rejectButton =
                    document.createElement(
                        "button"
                    );


                rejectButton.innerHTML =
                    "Reject";

                rejectButton.className =
                    "backButton";


                rejectButton.onclick =
                    function() {

                        rejectRequest(
                            request
                        );

                    };


                box.appendChild(
                    approveButton
                );

                box.appendChild(
                    rejectButton
                );


                container.appendChild(
                    box
                );

            }
        );


    } catch (error) {

        console.error(
            "Unexpected admin request error:",
            error
        );

        container.innerHTML =
            "Unable to load access requests.";

    }

}


// ========================================
// APPROVE USER
// ========================================

async function approveUser(
    request
) {

    if (
        !confirm(
            "Approve " +
            request.email +
            "?"
        )
    ) {

        return;

    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from(
                    "approved_users"
                )
                .insert({

                    email:
                        request.email,

                    name:
                        request.name,

                    reason:
                        request.reason

                });


        if (error) {

            console.error(
                "Approval error:",
                error
            );

            alert(
                "Unable to approve user: " +
                error.message
            );

            return;

        }


        const {
            error: deleteError
        } =
            await supabaseClient
                .from(
                    "access_requests"
                )
                .delete()
                .eq(
                    "id",
                    request.id
                );


        if (deleteError) {

            console.error(
                "Delete request error:",
                deleteError
            );

        }


        alert(
            "User approved successfully."
        );


        await loadAdminRequests();

        await loadApprovedUsers();


    } catch (error) {

        console.error(
            "Unexpected approval error:",
            error
        );

        alert(
            "Unable to approve user."
        );

    }

}


// ========================================
// REJECT REQUEST
// ========================================

async function rejectRequest(
    request
) {

    if (
        !confirm(
            "Reject this access request?"
        )
    ) {

        return;

    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from(
                    "access_requests"
                )
                .delete()
                .eq(
                    "id",
                    request.id
                );


        if (error) {

            console.error(
                "Reject error:",
                error
            );

            alert(
                "Unable to reject request: " +
                error.message
            );

            return;

        }


        await loadAdminRequests();


    } catch (error) {

        console.error(
            "Unexpected reject error:",
            error
        );

        alert(
            "Unable to reject request."
        );

    }

}


// ========================================
// LOAD APPROVED USERS
// ========================================

async function loadApprovedUsers() {

    const container =
        document.getElementById(
            "approvedUsersList"
        );


    container.innerHTML =
        "Loading approved users...";


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from(
                    "approved_users"
                )
                .select("*")
                .order(
                    "approved_at",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                "Approved users error:",
                error
            );

            container.innerHTML =
                "Unable to load approved users.";

            return;

        }


        if (
            !data ||
            data.length === 0
        ) {

            container.innerHTML =
                "No approved users.";

            return;

        }


        container.innerHTML = "";


        data.forEach(
            function(user) {

                const box =
                    document.createElement(
                        "div"
                    );


                box.style.border =
                    "1px solid #ccc";

                box.style.padding =
                    "10px";

                box.style.marginBottom =
                    "8px";

                box.style.borderRadius =
                    "8px";


                box.innerHTML =
                    "<strong>" +
                    escapeHTML(
                        user.email
                    ) +
                    "</strong>" +
                    "<br>" +
                    "Approved: " +
                    new Date(
                        user.approved_at ||
                        user.created_at
                    ).toLocaleString();


                container.appendChild(
                    box
                );

            }
        );


    } catch (error) {

        console.error(
            "Unexpected approved users error:",
            error
        );

        container.innerHTML =
            "Unable to load approved users.";

    }

}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ========================================
// INITIAL SCREEN
// ========================================

showOnly(
    "loginScreen"
);

checkAdminAccess();
