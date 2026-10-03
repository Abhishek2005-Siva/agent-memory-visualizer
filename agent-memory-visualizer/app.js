/* =========================================================
   AGENT MEMORY VISUALIZER
   Frontend-only educational prototype
========================================================= */


/* =========================================================
   APPLICATION STATE
========================================================= */

const state = {
    workingMemory: {
        active: false,
        question: null,
        activeConcepts: []
    },

    episodicMemory: [],

    semanticMemory: [],

    externalKnowledge: [],

    contradiction: null,

    currentStage: "captured",

    selectedMemory: null
};


/* =========================================================
   DOM REFERENCES
========================================================= */

const memoryInput =
    document.getElementById("memory-input");

const processButton =
    document.getElementById("process-button");

const pipelineStatus =
    document.getElementById("pipeline-status");

const workingMemoryContent =
    document.getElementById("working-memory-content");

const episodicMemoryContent =
    document.getElementById("episodic-memory-content");

const semanticMemoryContent =
    document.getElementById("semantic-memory-content");

const externalMemoryContent =
    document.getElementById("external-memory-content");

const graph =
    document.getElementById("knowledge-graph");

const graphCount =
    document.getElementById("graph-count");

const memoryDetails =
    document.getElementById("memory-details");

const decisionTrace =
    document.getElementById("decision-trace");

const decisionTraceStatus =
    document.getElementById("decision-trace-status");

const toast =
    document.getElementById("toast");

const consolidateButton =
    document.getElementById("consolidate-button");

const exportButton =
    document.getElementById("export-button");

const retrieveButton =
    document.getElementById("retrieve-button");

const forgetButton =
    document.getElementById("forget-button");

const viewBundleButton =
    document.getElementById("view-bundle-button");


/* =========================================================
   INITIALIZATION
========================================================= */

function initialize() {

    console.log(
        "Agent Memory Visualizer initialized."
    );

    renderMemoryCards();

    renderKnowledgeGraph();

    renderDecisionTrace([]);

    updateActionButtons();
}


initialize();


/* =========================================================
   PIPELINE
========================================================= */

function setPipelineStage(stage, message) {

    state.currentStage = stage;

    document
        .querySelectorAll(".pipeline-stage")
        .forEach(element => {

            element.classList.remove("active");

        });


    const activeStage =
        document.querySelector(
            `.pipeline-stage[data-stage="${stage}"]`
        );


    if (activeStage) {

        activeStage.classList.add("active");

    }


    if (pipelineStatus) {

        pipelineStatus.textContent =
            message;

    }
}


/* =========================================================
   DECISION TRACE
========================================================= */

function renderDecisionTrace(steps) {

    if (!decisionTrace) {

        return;

    }


    if (
        !steps ||
        steps.length === 0
    ) {

        decisionTrace.innerHTML = `
            <div class="decision-empty">
                Process a memory to see how the agent makes its decision.
            </div>
        `;

        if (decisionTraceStatus) {

            decisionTraceStatus.textContent =
                "Waiting for input";

        }

        return;
    }


    decisionTrace.innerHTML =
        steps
            .map(
                (step, index) => {

                    return `
                        <div class="decision-step">

                            <div class="decision-step-number">
                                ${String(index + 1).padStart(2, "0")}
                            </div>

                            <div class="decision-step-content">

                                <div class="decision-step-label">
                                    ${escapeHTML(step.label)}
                                </div>

                                <div class="decision-step-value">
                                    ${step.value}
                                </div>

                            </div>

                        </div>

                        ${
                            index < steps.length - 1
                                ? `<div class="decision-arrow"></div>`
                                : ""
                        }
                    `;
                }
            )
            .join("");


    if (decisionTraceStatus) {

        decisionTraceStatus.textContent =
            `${steps.length} decision steps`;

    }
}


/* =========================================================
   MEMORY CLASSIFICATION
========================================================= */

function classifyMemory(text) {

    const normalized =
        text
            .toLowerCase()
            .trim();


    /* ---------------------------------------------------------
       WORKING MEMORY
    --------------------------------------------------------- */

    if (
        normalized.includes("?") ||
        normalized.startsWith("how ") ||
        normalized.startsWith("what ") ||
        normalized.startsWith("why ") ||
        normalized.startsWith("where ") ||
        normalized.startsWith("which ")
    ) {

        return {

            type: "working",

            question: text,

            activeConcepts:
                extractConcepts(text)

        };

    }


    /* ---------------------------------------------------------
       EPISODIC MEMORY
    --------------------------------------------------------- */

    if (
        normalized.includes("agent") ||
        normalized.includes("handed") ||
        normalized.includes("told") ||
        normalized.includes("learned") ||
        normalized.includes("discovered") ||
        normalized.includes("found out") ||
        normalized.includes("met") ||
        normalized.includes("conversation") ||
        normalized.includes("event")
    ) {

        return {

            type: "episodic",

            event: text,

            timestamp:
                new Date().toLocaleString(),

            source:
                "Agent interaction"

        };

    }


    /* ---------------------------------------------------------
       SEMANTIC MEMORY
    --------------------------------------------------------- */

    return {

        type: "semantic",

        subject:
            extractSubject(text),

        relation:
            extractRelation(text),

        object:
            extractObject(text),

        source:
            "Agent interaction",

        confidence:
            0.97

    };
}

/* =========================================================
   CONTRADICTION DETECTION
========================================================= */

function detectContradiction(classification) {

    if (!classification) {
        return null;
    }

    if (classification.type !== "semantic") {
        return null;
    }

    if (
        !classification.subject ||
        !classification.relation ||
        !classification.object
    ) {
        return null;
    }

    const conflictingMemory =
        state.semanticMemory.find(memory =>

            memory.subject === classification.subject &&

            memory.relation === classification.relation &&

            memory.object !== classification.object
        );

    if (!conflictingMemory) {
        return null;
    }

    return {
        existing: conflictingMemory,

        incoming: {
            subject: classification.subject,
            relation: classification.relation,
            object: classification.object,
            source: classification.source,
            confidence: classification.confidence
        },

        detectedAt:
            new Date().toLocaleString()
    };
}

/* =========================================================
   DISPLAY CONTRADICTION
========================================================= */

function displayContradiction(contradiction) {

    if (!decisionTrace) {
        return;
    }

    const existing =
        contradiction.existing;

    const incoming =
        contradiction.incoming;

    decisionTrace.innerHTML = `
        <div class="decision-step">
            <div class="decision-step-number">
                01
            </div>

            <div class="decision-step-content">
                <div class="decision-step-label">
                    Existing Knowledge
                </div>

                <div class="decision-step-value">
                    <strong>
                        ${escapeHTML(existing.subject)}
                    </strong>

                    →
                    ${escapeHTML(existing.relation)}
                    →

                    <strong>
                        ${escapeHTML(existing.object)}
                    </strong>

                    <br><br>

                    <span class="empty">
                        Confidence:
                        ${existing.confidence}
                    </span>
                </div>
            </div>
        </div>

        <div class="decision-arrow"></div>

        <div class="decision-step">
            <div class="decision-step-number">
                02
            </div>

            <div class="decision-step-content">
                <div class="decision-step-label">
                    New Information
                </div>

                <div class="decision-step-value">
                    <strong>
                        ${escapeHTML(incoming.subject)}
                    </strong>

                    →
                    ${escapeHTML(incoming.relation)}
                    →

                    <strong>
                        ${escapeHTML(incoming.object)}
                    </strong>

                    <br><br>

                    <span class="empty">
                        Confidence:
                        ${incoming.confidence}
                    </span>
                </div>
            </div>
        </div>

        <div class="decision-arrow"></div>

        <div class="decision-step">
            <div class="decision-step-number">
                ⚠
            </div>

            <div class="decision-step-content">
                <div class="decision-step-label">
                    Contradiction Detected
                </div>

                <div class="decision-step-value">
                    Both memories describe
                    <strong>
                        ${escapeHTML(incoming.subject)}
                    </strong>
                    with the same relationship
                    <strong>
                        ${escapeHTML(incoming.relation)}
                    </strong>
                    but provide different values.
                </div>
            </div>
        </div>

        <div class="decision-arrow"></div>

        <div class="decision-step">
            <div class="decision-step-number">
                04
            </div>

            <div class="decision-step-content">
                <div class="decision-step-label">
                    Resolution Required
                </div>

                <div class="decision-step-value">

                    The agent will not overwrite
                    the existing knowledge automatically.

                    <br><br>

                    <button
                        class="action-button"
                        id="keep-existing-button"
                        type="button"
                    >
                        Keep Python
                    </button>

                    <button
                        class="action-button"
                        id="accept-new-button"
                        type="button"
                    >
                        Accept Java
                    </button>

                </div>
            </div>
        </div>
    `;

    if (decisionTraceStatus) {
        decisionTraceStatus.textContent =
            "Contradiction detected";
    }

    state.contradiction =
        contradiction;

    const keepExistingButton =
        document.getElementById(
            "keep-existing-button"
        );

    const acceptNewButton =
        document.getElementById(
            "accept-new-button"
        );

    if (keepExistingButton) {
        keepExistingButton.addEventListener(
            "click",
            () => resolveContradiction("existing")
        );
    }

    if (acceptNewButton) {
        acceptNewButton.addEventListener(
            "click",
            () => resolveContradiction("incoming")
        );
    }
}

/* =========================================================
   RESOLVE CONTRADICTION
========================================================= */

function resolveContradiction(choice) {

    const contradiction =
        state.contradiction;

    if (!contradiction) {
        return;
    }

    const existing =
        contradiction.existing;

    const incoming =
        contradiction.incoming;

    if (choice === "existing") {

        state.contradiction = null;

        renderDecisionTrace([
            {
                label: "Contradiction",
                value:
                    "Existing knowledge conflicted with new information."
            },
            {
                label: "Resolution",
                value: `
                    Keep
                    <strong>
                        ${escapeHTML(existing.object)}
                    </strong>
                    as the active value.
                `
            },
            {
                label: "Decision",
                value: `
                    New information was rejected.
                    Existing semantic memory remains unchanged.
                `
            }
        ]);

        pipelineStatus.textContent =
            "Contradiction resolved — existing knowledge kept.";

        state.currentStage =
            "consolidated";

        return;
    }


    if (choice === "incoming") {

        const index =
            state.semanticMemory.findIndex(
                memory =>
                    memory.id === existing.id
            );

        if (index !== -1) {

            state.semanticMemory[index] = {

                ...state.semanticMemory[index],

                object:
                    incoming.object,

                confidence:
                    incoming.confidence,

                source:
                    "Updated after contradiction resolution",

                updatedAt:
                    new Date().toLocaleString()
            };
        }

        state.contradiction = null;

        renderMemoryCards();

        renderKnowledgeGraph();

        renderDecisionTrace([
            {
                label: "Contradiction",
                value:
                    "Existing knowledge conflicted with new information."
            },
            {
                label: "Resolution",
                value: `
                    Replace
                    <strong>
                        ${escapeHTML(existing.object)}
                    </strong>
                    with
                    <strong>
                        ${escapeHTML(incoming.object)}
                    </strong>.
                `
            },
            {
                label: "Decision",
                value: `
                    The semantic memory was updated
                    and the new value is now active.
                `
            }
        ]);

        selectMemory("semantic");

        pipelineStatus.textContent =
            "Contradiction resolved — new knowledge accepted.";
    }
}


/* =========================================================
   CONCEPT EXTRACTION
========================================================= */

function extractConcepts(text) {

    const knownConcepts = [

        "Operating System",

        "REST API",

        "FastAPI",

        "Runtime",

        "Python",

        "Java",

        "OKF",

        "knowledge bundle"

    ];


    return knownConcepts.filter(

        concept =>
            text
                .toLowerCase()
                .includes(
                    concept.toLowerCase()
                )

    );
}


/* =========================================================
   SUBJECT EXTRACTION
========================================================= */

function extractSubject(text) {

    const patterns = [

        /^(.+?)\s+is\s+written\s+in\s+/i,

        /^(.+?)\s+runs\s+on\s+/i,

        /^(.+?)\s+uses\s+/i,

        /^(.+?)\s+is\s+implemented\s+using\s+/i,

        /^(.+?)\s+is\s+built\s+with\s+/i,

        /^(.+?)\s+depends\s+on\s+/i,

        /^(.+?)\s+is\s+part\s+of\s+/i

    ];


    for (
        const pattern of patterns
    ) {

        const match =
            text.match(pattern);


        if (match) {

            return cleanConcept(
                match[1]
            );

        }

    }


    const knownConcepts = [

        "Operating System",

        "REST API",

        "FastAPI",

        "Runtime",

        "Python",

        "Java",

        "OKF"

    ];


    const normalized =
        text.toLowerCase();


    const matches =
        knownConcepts.filter(

            concept =>
                normalized.includes(
                    concept.toLowerCase()
                )

        );


    if (matches.length > 0) {

        matches.sort(
            (a, b) =>
                b.length - a.length
        );

        return matches[0];

    }


    return cleanConcept(

        text
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .join(" ")

    );
}


/* =========================================================
   RELATION EXTRACTION
========================================================= */

function extractRelation(text) {

    const normalized =
        text.toLowerCase();


    if (
        normalized.includes(
            "written in"
        )
    ) {

        return "written_in";

    }


    if (
        normalized.includes(
            "implemented using"
        )
    ) {

        return "implemented_using";

    }


    if (
        normalized.includes(
            "runs on"
        )
    ) {

        return "runs_on";

    }


    if (
        normalized.includes(
            "uses"
        )
    ) {

        return "uses";

    }


    if (
        normalized.includes(
            "built with"
        )
    ) {

        return "built_with";

    }


    if (
        normalized.includes(
            "depends on"
        )
    ) {

        return "depends_on";

    }


    if (
        normalized.includes(
            "part of"
        )
    ) {

        return "part_of";

    }


    return "related_to";
}


/* =========================================================
   OBJECT EXTRACTION
========================================================= */

function extractObject(text) {

    const patterns = [

        /is\s+written\s+in\s+(.+)$/i,

        /is\s+implemented\s+using\s+(.+)$/i,

        /is\s+built\s+with\s+(.+)$/i,

        /depends\s+on\s+(.+)$/i,

        /runs\s+on\s+(.+)$/i,

        /uses\s+(.+)$/i,

        /is\s+part\s+of\s+(.+)$/i

    ];


    for (
        const pattern of patterns
    ) {

        const match =
            text.match(pattern);


        if (match) {

            return cleanConcept(
                match[1]
            );

        }

    }


    const knownConcepts = [

        "Operating System",

        "REST API",

        "FastAPI",

        "Runtime",

        "Python",

        "Java",

        "OKF"

    ];


    const normalized =
        text.toLowerCase();


    const matches =
        knownConcepts.filter(

            concept =>
                normalized.includes(
                    concept.toLowerCase()
                )

        );


    if (matches.length >= 2) {

        matches.sort(

            (a, b) =>
                normalized.indexOf(
                    a.toLowerCase()
                )
                -
                normalized.indexOf(
                    b.toLowerCase()
                )

        );


        return matches[1];

    }


    const parts =
        text
            .trim()
            .split(/\s+/);


    return cleanConcept(
        parts[parts.length - 1]
    );
}


/* =========================================================
   CLEAN TEXT
========================================================= */

function cleanConcept(value) {

    return String(value)

        .trim()

        .replace(
            /^[\s"'`]+|[\s"'`]+$/g,
            ""
        )

        .replace(
            /[.!?,;:]+$/,
            ""
        )

        .trim();
}


/* =========================================================
   CREATE MEMORY
========================================================= */

function createMemory(classification) {

    const id =
        `memory-${Date.now()}`;


    /* ---------------------------------------------------------
       WORKING
    --------------------------------------------------------- */

    if (
        classification.type ===
        "working"
    ) {

        state.workingMemory = {

            active: true,

            question:
                classification.question,

            activeConcepts:
                classification.activeConcepts || []

        };

    }


    /* ---------------------------------------------------------
       EPISODIC
    --------------------------------------------------------- */

    if (
        classification.type ===
        "episodic"
    ) {

        state.episodicMemory.push({

            id,

            type:
                "episodic",

            event:
                classification.event,

            timestamp:
                classification.timestamp,

            source:
                classification.source

        });

    }


    /* ---------------------------------------------------------
       SEMANTIC
    --------------------------------------------------------- */

    if (
        classification.type ===
        "semantic"
    ) {

        const validRelationship =

            classification.subject &&
            classification.object &&
            classification.subject !==
                classification.object;


        if (validRelationship) {

            const duplicate =
                state.semanticMemory.some(

                    memory =>

                        memory.subject ===
                            classification.subject &&

                        memory.relation ===
                            classification.relation &&

                        memory.object ===
                            classification.object

                );


            if (!duplicate) {

                state.semanticMemory.push({

                    id,

                    type:
                        "semantic",

                    subject:
                        classification.subject,

                    relation:
                        classification.relation,

                    object:
                        classification.object,

                    source:
                        classification.source,

                    confidence:
                        classification.confidence

                });

            }

        }

    }


    state.selectedMemory =
        classification.type;
}


/* =========================================================
   EXTRACT FACT FROM EVENT
========================================================= */

function extractFactFromEvent(text) {

    const patterns = [

        /(?:learned|knows|discovered|found out)\s+(?:that\s+)?(.+)/i,

        /(?:was told|told)\s+(?:that\s+)?(.+)/i

    ];


    for (
        const pattern of patterns
    ) {

        const match =
            text.match(pattern);


        if (match) {

            return cleanConcept(
                match[1]
            );

        }

    }


    return null;
}


/* =========================================================
   CONSOLIDATION
========================================================= */

function consolidateMemory() {

    if (
        state.episodicMemory.length === 0
    ) {

        return null;

    }


    const episode =
        state.episodicMemory[
            state.episodicMemory.length - 1
        ];


    const fact =
        extractFactFromEvent(
            episode.event
        );


    if (!fact) {

        return null;

    }


    const classification =
        classifyMemory(fact);


    if (
        classification.type !==
        "semantic"
    ) {

        return null;

    }


    if (
        !classification.subject ||
        !classification.object ||
        classification.subject ===
            classification.object
    ) {

        return null;

    }


    const exists =
        state.semanticMemory.some(

            memory =>

                memory.subject ===
                    classification.subject &&

                memory.relation ===
                    classification.relation &&

                memory.object ===
                    classification.object

        );


    if (exists) {

        return null;

    }


    const semanticMemory = {

        id:
            `consolidated-${Date.now()}`,

        type:
            "semantic",

        subject:
            classification.subject,

        relation:
            classification.relation,

        object:
            classification.object,

        source:
            "Consolidated from episodic memory",

        confidence:
            0.92,

        consolidated:
            true

    };


    state.semanticMemory.push(
        semanticMemory
    );


    return semanticMemory;
}


/* =========================================================
   EXPORT KNOWLEDGE BUNDLE
========================================================= */

function exportKnowledgeBundle() {

    return {

        version:
            "1.0",

        createdAt:
            new Date().toISOString(),

        memories: {

            semantic:
                state.semanticMemory,

            episodic:
                state.episodicMemory

        },

        relationships:

            state.semanticMemory.map(

                memory => ({

                    subject:
                        memory.subject,

                    relation:
                        memory.relation,

                    object:
                        memory.object,

                    confidence:
                        memory.confidence

                })

            )

    };
}


/* =========================================================
   RETRIEVE KNOWLEDGE
========================================================= */

function retrieveKnowledge(query) {

    const normalizedQuery =
        query.toLowerCase();


    return state.semanticMemory.filter(

        memory => {

            const subject =
                memory.subject.toLowerCase();

            const object =
                memory.object.toLowerCase();


            return (

                normalizedQuery.includes(
                    subject
                )

                ||

                normalizedQuery.includes(
                    object
                )

            );

        }

    );
}


/* =========================================================
   PROCESS MEMORY
========================================================= */

async function processMemory() {

    console.log(
        "PROCESS MEMORY STARTED"
    );


    const text =
        memoryInput.value.trim();


    if (!text) {

        pipelineStatus.textContent =
            "Enter something first.";

        memoryInput.focus();

        return;

    }


    processButton.disabled = true;

    processButton.textContent =
        "Processing...";


    try {

        /* -----------------------------------------------------
           1. CAPTURE
        ----------------------------------------------------- */

        setPipelineStage(
            "captured",
            "Input captured"
        );

        await wait(400);


        /* -----------------------------------------------------
           2. EXTRACTION
        ----------------------------------------------------- */

        setPipelineStage(
            "extracted",
            "Extracting concepts..."
        );

        await wait(400);


        /* -----------------------------------------------------
           3. CLASSIFICATION
        ----------------------------------------------------- */

        const classification =
            classifyMemory(text);


        console.log(
            "Classification:",
            classification
        );

        /* =========================================
        CONTRADICTION CHECK
        ========================================= */

        const contradiction =
            detectContradiction(
                classification
            );

        if (contradiction) {

            console.log(
                "CONTRADICTION DETECTED:",
                contradiction
            );

            displayContradiction(
                contradiction
            );

            setPipelineStage(
                "classified",
                "Contradiction detected — resolution required"
            );

            return;
        }


        /* -----------------------------------------------------
           NOTHING TO STORE
           A statement with no extractable subject/object would
           otherwise be dropped silently, so say so.
        ----------------------------------------------------- */

        if (
            classification.type === "semantic" &&
            !(
                classification.subject &&
                classification.object &&
                classification.subject !== classification.object
            )
        ) {

            renderDecisionTrace([
                {
                    label: "Input",
                    value: `"${escapeHTML(text)}"`
                },
                {
                    label: "Classification",
                    value: `Classified as <strong>Semantic Memory</strong>`
                },
                {
                    label: "Decision",
                    value: `
                        <strong>Not stored.</strong>
                        No subject and object could be extracted.
                        Try a statement such as
                        "FastAPI is written in Python".
                    `
                }
            ]);

            setPipelineStage(
                "classified",
                "No relationship found — try “X is written in Y”"
            );

            return;

        }


        /* -----------------------------------------------------
           DECISION TRACE
        ----------------------------------------------------- */

        const trace = [

            {

                label:
                    "Input",

                value:
                    `"${escapeHTML(text)}"`

            },

            {

                label:
                    "Classification",

                value:
                    `
                        Classified as
                        <strong>
                            ${capitalize(
                                classification.type
                            )}
                            Memory
                        </strong>
                    `

            }

        ];


        if (
            classification.type ===
            "semantic"
        ) {

            trace.push(

                {

                    label:
                        "Subject",

                    value:
                        `<strong>${escapeHTML(
                            classification.subject
                        )}</strong>`

                },

                {

                    label:
                        "Relation",

                    value:
                        `<strong>${escapeHTML(
                            classification.relation
                        )}</strong>`

                },

                {

                    label:
                        "Object",

                    value:
                        `<strong>${escapeHTML(
                            classification.object
                        )}</strong>`

                },

                {

                    label:
                        "Decision",

                    value:
                        `
                            Store as
                            <strong>
                                Semantic Memory
                            </strong>
                            because the input contains
                            reusable knowledge.
                        `

                }

            );

        }


        if (
            classification.type ===
            "episodic"
        ) {

            trace.push({

                label:
                    "Decision",

                value:
                    `
                        Store as
                        <strong>
                            Episodic Memory
                        </strong>
                        because the input describes
                        an event or interaction.
                    `

            });

        }


        if (
            classification.type ===
            "working"
        ) {

            trace.push({

                label:
                    "Decision",

                value:
                    `
                        Store in
                        <strong>
                            Working Memory
                        </strong>
                        because the input is an
                        active question or task.
                    `

            });

        }


        renderDecisionTrace(trace);


        setPipelineStage(
            "classified",
            `Identified ${classification.type} memory`
        );


        await wait(500);


        /* -----------------------------------------------------
           4. STORE
        ----------------------------------------------------- */

        createMemory(
            classification
        );


        renderMemoryCards();

        renderKnowledgeGraph();

        updateActionButtons();


        setPipelineStage(
            "stored",
            `${capitalize(
                classification.type
            )} memory stored`
        );


        await wait(500);


        /* -----------------------------------------------------
           5. CONSOLIDATION
        ----------------------------------------------------- */

        setPipelineStage(
            "consolidated",
            "Consolidating memory..."
        );


        await wait(600);


        const consolidated =
            consolidateMemory();


        if (consolidated) {

            renderMemoryCards();

            renderKnowledgeGraph();

            renderDecisionTrace([

                {

                    label:
                        "Consolidation",

                    value:
                        `
                            Episodic information was
                            converted into
                            <strong>
                                Semantic Memory
                            </strong>.
                        `

                },

                {

                    label:
                        "Knowledge",

                    value:
                        `
                            <strong>
                                ${escapeHTML(
                                    consolidated.subject
                                )}
                            </strong>

                            →

                            ${escapeHTML(
                                consolidated.relation
                            )}

                            →

                            <strong>
                                ${escapeHTML(
                                    consolidated.object
                                )}
                            </strong>
                        `

                }

            ]);


            setPipelineStage(
                "consolidated",
                "Memory consolidated into semantic knowledge"
            );

        }
        else {

            setPipelineStage(
                "consolidated",
                "No new semantic knowledge to consolidate"
            );

        }


        updateActionButtons();

        await wait(500);


        /* -----------------------------------------------------
           6. EXPORT
        ----------------------------------------------------- */

        setPipelineStage(
            "exported",
            "Creating knowledge bundle..."
        );


        await wait(500);


        const bundle =
            exportKnowledgeBundle();


        state.externalKnowledge.push(
            bundle
        );


        renderMemoryCards();

        updateActionButtons();


        setPipelineStage(
            "exported",
            "Knowledge bundle ready"
        );


        await wait(300);


        /* -----------------------------------------------------
           FINAL
        ----------------------------------------------------- */

        renderMemoryCards();

        renderKnowledgeGraph();

        updateActionButtons();


        if (consolidated) {

            selectMemory(
                "semantic"
            );

        }
        else {

            selectMemory(
                classification.type
            );

        }


        memoryInput.value = "";


        console.log(
            "MEMORY PROCESSING COMPLETE"
        );

    }

    catch (error) {

        console.error(
            "MEMORY PROCESSING ERROR:",
            error
        );


        pipelineStatus.textContent =
            "Processing error. Check browser console.";

    }

    finally {

        processButton.disabled =
            false;

        processButton.textContent =
            "Process Memory →";

    }
}


/* =========================================================
   RENDER MEMORY CARDS
========================================================= */

function renderMemoryCards() {


    /* ---------------------------------------------------------
       WORKING MEMORY
    --------------------------------------------------------- */

    if (
        state.workingMemory.active
    ) {

        const concepts =
            state.workingMemory.activeConcepts;


        workingMemoryContent.innerHTML = `

            <div>

                <strong>
                    Current question
                </strong>

                <br>

                ${escapeHTML(
                    state.workingMemory.question
                )}

                ${
                    concepts.length > 0
                        ? `
                            <br><br>

                            <strong>
                                Active concepts
                            </strong>

                            <br>

                            ${concepts
                                .map(
                                    concept =>
                                        `<span class="memory-chip">
                                            ${escapeHTML(concept)}
                                        </span>`
                                )
                                .join(" ")
                            }
                        `
                        : ""
                }

            </div>

        `;

    }
    else {

        workingMemoryContent.innerHTML = `

            <div class="empty-state">

                <div class="empty-title">
                    No active task
                </div>

                <div class="empty-description">
                    Working information will appear here.
                </div>

            </div>

        `;

    }


    /* ---------------------------------------------------------
       EPISODIC MEMORY
    --------------------------------------------------------- */

    const latestEpisode =
        state.episodicMemory[
            state.episodicMemory.length - 1
        ];


    if (latestEpisode) {

        episodicMemoryContent.innerHTML = `

            <div>

                <strong>
                    ${escapeHTML(
                        latestEpisode.event
                    )}
                </strong>

                <br><br>

                <span class="memory-meta">
                    ${escapeHTML(
                        latestEpisode.timestamp
                    )}
                </span>

                <br>

                <span class="memory-meta">
                    Source:
                    ${escapeHTML(
                        latestEpisode.source
                    )}
                </span>

            </div>

        `;

    }
    else {

        episodicMemoryContent.innerHTML = `

            <div class="empty-state">

                <div class="empty-title">
                    No events captured
                </div>

                <div class="empty-description">
                    Agent interactions will appear here.
                </div>

            </div>

        `;

    }


    /* ---------------------------------------------------------
       SEMANTIC MEMORY
    --------------------------------------------------------- */

    const latestSemantic =
        state.semanticMemory[
            state.semanticMemory.length - 1
        ];


    if (latestSemantic) {

        semanticMemoryContent.innerHTML = `

            <div>

                <div class="semantic-relationship">

                    <strong>
                        ${escapeHTML(
                            latestSemantic.subject
                        )}
                    </strong>

                    <span>
                        →
                    </span>

                    <code>
                        ${escapeHTML(
                            latestSemantic.relation
                        )}
                    </code>

                    <span>
                        →
                    </span>

                    <strong>
                        ${escapeHTML(
                            latestSemantic.object
                        )}
                    </strong>

                </div>

                <br>

                <span class="memory-meta">
                    Confidence:
                    ${latestSemantic.confidence}
                </span>

                <br>

                <span class="memory-meta">
                    Source:
                    ${escapeHTML(
                        latestSemantic.source
                    )}
                </span>

            </div>

        `;

    }
    else {

        semanticMemoryContent.innerHTML = `

            <div class="empty-state">

                <div class="empty-title">
                    No semantic knowledge
                </div>

                <div class="empty-description">
                    Structured relationships will appear here.
                </div>

            </div>

        `;

    }


    /* ---------------------------------------------------------
       EXTERNAL KNOWLEDGE
    --------------------------------------------------------- */

    const latestBundle =
        state.externalKnowledge[
            state.externalKnowledge.length - 1
        ];


    if (latestBundle) {

        externalMemoryContent.innerHTML = `

            <div>

                <strong>
                    OKF Knowledge Bundle
                </strong>

                <br><br>

                <span class="memory-meta">
                    Version:
                    ${escapeHTML(
                        latestBundle.version
                    )}
                </span>

                <br>

                <span class="memory-meta">
                    Semantic memories:
                    ${latestBundle.memories.semantic.length}
                </span>

                <br>

                <span class="memory-meta">
                    Relationships:
                    ${latestBundle.relationships.length}
                </span>

                <br><br>

                <button
                    id="view-bundle-button"
                    class="memory-details-button"
                    type="button"
                >
                    View bundle
                    <span>→</span>
                </button>

            </div>

        `;


        const dynamicViewButton =
            document.getElementById(
                "view-bundle-button"
            );


        if (dynamicViewButton) {

            dynamicViewButton.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    viewKnowledgeBundle();

                }
            );

        }

    }
    else {

        externalMemoryContent.innerHTML = `

            <div class="empty-state">

                <div class="empty-title">
                    No external knowledge
                </div>

                <div class="empty-description">
                    An OKF bundle will appear after export.
                </div>

            </div>

        `;

    }
}


/* =========================================================
   KNOWLEDGE GRAPH
========================================================= */

function renderKnowledgeGraph() {

    if (!graph) {
        return;
    }


    const memories =
        state.semanticMemory;


    if (
        memories.length === 0
    ) {

        graph.innerHTML = `

            <div class="graph-empty-state">

                <div class="graph-symbol">
                    ◇
                </div>

                <div class="graph-empty-title">
                    No relationships yet
                </div>

                <div class="graph-empty-description">
                    Process a piece of knowledge to create
                    a semantic relationship.
                </div>

            </div>

        `;


        if (graphCount) {

            graphCount.textContent =
                "0 concepts · 0 relationships";

        }

        return;

    }


    const nodes = [];

    memories.forEach(memory => {

        if (
            !nodes.includes(
                memory.subject
            )
        ) {

            nodes.push(
                memory.subject
            );

        }


        if (
            !nodes.includes(
                memory.object
            )
        ) {

            nodes.push(
                memory.object
            );

        }

    });


    const width =
        graph.clientWidth || 800;

    const height =
        graph.clientHeight || 400;


    const centerX =
        width / 2;

    const centerY =
        height / 2;


    const radius =
        Math.min(
            width,
            height
        ) * 0.30;


    const positions = {};


    nodes.forEach(
        (node, index) => {

            const angle =
                (
                    Math.PI * 2 * index
                ) /
                nodes.length;


            positions[node] = {

                x:
                    centerX +
                    Math.cos(angle) *
                    radius,

                y:
                    centerY +
                    Math.sin(angle) *
                    radius

            };

        }
    );


    let svg = `

        <svg
            width="100%"
            height="100%"
            viewBox="0 0 ${width} ${height}"
            xmlns="http://www.w3.org/2000/svg"
        >

            <defs>

                <marker
                    id="arrow"
                    viewBox="0 0 10 10"
                    refX="9"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                >

                    <path
                        d="M 0 0 L 10 5 L 0 10 z"
                        fill="currentColor"
                    />

                </marker>

            </defs>

    `;


    /* ---------------------------------------------------------
       EDGES
    --------------------------------------------------------- */

    memories.forEach(memory => {

        const from =
            positions[
                memory.subject
            ];

        const to =
            positions[
                memory.object
            ];


        if (!from || !to) {
            return;
        }


        const dx =
            to.x - from.x;

        const dy =
            to.y - from.y;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        const offset =
            38;


        const startX =
            from.x +
            (dx / distance) *
            offset;

        const startY =
            from.y +
            (dy / distance) *
            offset;


        const endX =
            to.x -
            (dx / distance) *
            offset;

        const endY =
            to.y -
            (dy / distance) *
            offset;


        const labelX =
            (
                startX +
                endX
            ) / 2;


        const labelY =
            (
                startY +
                endY
            ) / 2;


        svg += `

            <line
                x1="${startX}"
                y1="${startY}"
                x2="${endX}"
                y2="${endY}"
                stroke="currentColor"
                stroke-width="1"
                marker-end="url(#arrow)"
                opacity="0.5"
            />

            <text
                x="${labelX}"
                y="${labelY - 8}"
                text-anchor="middle"
                font-size="11"
                fill="currentColor"
                opacity="0.65"
            >
                ${escapeHTML(
                    memory.relation
                )}
            </text>

        `;

    });


    /* ---------------------------------------------------------
       NODES
    --------------------------------------------------------- */

    nodes.forEach(node => {

        const position =
            positions[node];


        svg += `

            <g>

                <circle
                    cx="${position.x}"
                    cy="${position.y}"
                    r="34"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                />

                <text
                    x="${position.x}"
                    y="${position.y + 4}"
                    text-anchor="middle"
                    font-size="12"
                    fill="currentColor"
                >
                    ${escapeHTML(node)}
                </text>

            </g>

        `;

    });


    svg += `</svg>`;


    graph.innerHTML =
        svg;


    if (graphCount) {

        graphCount.textContent =
            `${nodes.length} concepts · ${memories.length} relationships`;

    }
}


/* =========================================================
   MEMORY DETAILS
========================================================= */

function selectMemory(type) {

    state.selectedMemory =
        type;


    renderMemoryDetails(
        type
    );


    updateActionButtons();


    document
        .querySelectorAll(".memory-card")
        .forEach(card => {

            card.classList.toggle(

                "selected",

                card.dataset.memoryType ===
                    type

            );

        });

}


function renderMemoryDetails(type) {

    if (!memoryDetails) {
        return;
    }


    /* ---------------------------------------------------------
       WORKING
    --------------------------------------------------------- */

    if (
        type === "working"
    ) {

        if (
            !state.workingMemory.active
        ) {

            memoryDetails.innerHTML = `

                <div class="details-empty-state">

                    <div class="details-empty-title">
                        No working memory
                    </div>

                    <div class="details-empty-description">
                        There is no active task.
                    </div>

                </div>

            `;

            return;

        }


        memoryDetails.innerHTML = `

            <div class="detail-list">

                <div class="detail-item">

                    <span class="detail-key">
                        Type
                    </span>

                    <span class="detail-value">
                        Working Memory
                    </span>

                </div>


                <div class="detail-item">

                    <span class="detail-key">
                        Question
                    </span>

                    <span class="detail-value">
                        ${escapeHTML(
                            state.workingMemory.question
                        )}
                    </span>

                </div>


                <div class="detail-item">

                    <span class="detail-key">
                        Active Concepts
                    </span>

                    <span class="detail-value">
                        ${state.workingMemory.activeConcepts
                            .map(
                                concept =>
                                    escapeHTML(concept)
                            )
                            .join(", ") || "None"}
                    </span>

                </div>

            </div>

        `;

        return;

    }


    /* ---------------------------------------------------------
       EPISODIC
    --------------------------------------------------------- */

    if (
        type === "episodic"
    ) {

        const memory =
            state.episodicMemory[
                state.episodicMemory.length - 1
            ];


        if (!memory) {

            memoryDetails.innerHTML = `

                <div class="details-empty-state">

                    <div class="details-empty-title">
                        No episodic memory
                    </div>

                    <div class="details-empty-description">
                        No events have been stored.
                    </div>

                </div>

            `;

            return;

        }


        memoryDetails.innerHTML = `

            <div class="detail-list">

                <div class="detail-item">

                    <span class="detail-key">
                        Type
                    </span>

                    <span class="detail-value">
                        Episodic Memory
                    </span>

                </div>


                <div class="detail-item">

                    <span class="detail-key">
                        Event
                    </span>

                    <span class="detail-value">
                        ${escapeHTML(
                            memory.event
                        )}
                    </span>

                </div>


                <div class="detail-item">

                    <span class="detail-key">
                        Timestamp
                    </span>

                    <span class="detail-value">
                        ${escapeHTML(
                            memory.timestamp
                        )}
                    </span>

                </div>


                <div class="detail-item">

                    <span class="detail-key">
                        Source
                    </span>

                    <span class="detail-value">
                        ${escapeHTML(
                            memory.source
                        )}
                    </span>

                </div>

            </div>

        `;

        return;

    }


    /* ---------------------------------------------------------
       SEMANTIC
    --------------------------------------------------------- */

    if (
        type === "semantic"
    ) {

        const memory =
            state.semanticMemory[
                state.semanticMemory.length - 1
            ];


        if (!memory) {

            memoryDetails.innerHTML = `

                <div class="details-empty-state">

                    <div class="details-empty-title">
                        No semantic memory
                    </div>

                    <div class="details-empty-description">
                        No structured knowledge exists yet.
                    </div>

                </div>

            `;

            return;

        }


        memoryDetails.innerHTML = `

            <div class="detail-list">

                <div class="detail-item">

                    <span class="detail-key">
                        Type
                    </span>

                    <span class="detail-value">
                        Semantic Memory
                    </span>

                </div>


                <div class="detail-item">

                    <span class="detail-key">
                        Subject
                    </span>

                    <span class="detail-value">
                        ${escapeHTML(
                            memory.subject
                        )}
                    </span>

                </div>


                <div class="detail-item">

                    <span class="detail-key">
                        Relation
                    </span>

                    <span class="detail-value">
                        ${escapeHTML(
                            memory.relation
                        )}
                    </span>

                </div>


                <div class="detail-item">

                    <span class="detail-key">
                        Object
                    </span>

                    <span class="detail-value">
                        ${escapeHTML(
                            memory.object
                        )}
                    </span>

                </div>


                <div class="detail-item">

                    <span class="detail-key">
                        Source
                    </span>

                    <span class="detail-value">
                        ${escapeHTML(
                            memory.source
                        )}
                    </span>

                </div>


                <div class="detail-item">

                    <span class="detail-key">
                        Confidence
                    </span>

                    <span class="detail-value">
                        ${memory.confidence}
                    </span>

                </div>


                <div class="detail-item">

                    <span class="detail-key">
                        Status
                    </span>

                    <span class="detail-value">
                        Active
                    </span>

                </div>

            </div>

        `;

        return;

    }


    /* ---------------------------------------------------------
       EXTERNAL
    --------------------------------------------------------- */

    if (
        type === "external"
    ) {

        const memory =
            state.externalKnowledge[
                state.externalKnowledge.length - 1
            ];


        if (!memory) {

            memoryDetails.innerHTML = `

                <div class="details-empty-state">

                    <div class="details-empty-title">
                        No external knowledge
                    </div>

                    <div class="details-empty-description">
                        Export semantic knowledge to create
                        an external bundle.
                    </div>

                </div>

            `;

            return;

        }


        memoryDetails.innerHTML = `

            <div class="detail-list">

                <div class="detail-item">

                    <span class="detail-key">
                        Type
                    </span>

                    <span class="detail-value">
                        External Knowledge
                    </span>

                </div>


                <div class="detail-item">

                    <span class="detail-key">
                        Format
                    </span>

                    <span class="detail-value">
                        OKF Knowledge Bundle
                    </span>

                </div>


                <div class="detail-item">

                    <span class="detail-key">
                        Semantic Memories
                    </span>

                    <span class="detail-value">
                        ${memory.memories.semantic.length}
                    </span>

                </div>


                <div class="detail-item">

                    <span class="detail-key">
                        Relationships
                    </span>

                    <span class="detail-value">
                        ${memory.relationships.length}
                    </span>

                </div>


                <div class="detail-item">

                    <span class="detail-key">
                        Status
                    </span>

                    <span class="detail-value">
                        Available for retrieval
                    </span>

                </div>

            </div>

        `;

    }
}


/* =========================================================
   VIEW KNOWLEDGE BUNDLE
========================================================= */

function viewKnowledgeBundle() {

    if (
        state.externalKnowledge.length === 0
    ) {

        showToast(
            "No knowledge bundle available."
        );

        return;

    }


    const bundle =
        state.externalKnowledge[
            state.externalKnowledge.length - 1
        ];


    alert(
        JSON.stringify(
            bundle,
            null,
            2
        )
    );
}


/* =========================================================
   FORGET MEMORY
========================================================= */

function forgetMemory(type) {

    let message =
        "";


    if (
        type === "working"
    ) {

        state.workingMemory = {

            active: false,

            question: null,

            activeConcepts: []

        };


        message =
            "Working memory forgotten.";

    }


    else if (
        type === "episodic"
    ) {

        if (
            state.episodicMemory.length === 0
        ) {

            message =
                "No episodic memory to forget.";

        }
        else {

            state.episodicMemory.pop();

            message =
                "Latest episodic memory forgotten.";

        }

    }


    else if (
        type === "semantic"
    ) {

        if (
            state.semanticMemory.length === 0
        ) {

            message =
                "No semantic memory to forget.";

        }
        else {

            state.semanticMemory.pop();

            message =
                "Latest semantic memory forgotten.";

        }

    }


    else if (
        type === "external"
    ) {

        if (
            state.externalKnowledge.length === 0
        ) {

            message =
                "No external knowledge to forget.";

        }
        else {

            state.externalKnowledge.pop();

            message =
                "Latest knowledge bundle forgotten.";

        }

    }


    state.selectedMemory =
        null;


    renderMemoryCards();

    renderKnowledgeGraph();


    memoryDetails.innerHTML = `

        <div class="details-empty-state">

            <div class="details-empty-title">
                Nothing selected
            </div>

            <div class="details-empty-description">
                Select a memory card to inspect its metadata.
            </div>

        </div>

    `;


    document
        .querySelectorAll(".memory-card")
        .forEach(
            card =>
                card.classList.remove(
                    "selected"
                )
        );


    updateActionButtons();


    pipelineStatus.textContent =
        message;


    showToast(
        message
    );
}


/* =========================================================
   ACTION BUTTONS
========================================================= */

function updateActionButtons() {

    if (consolidateButton) {

        consolidateButton.disabled =
            state.episodicMemory.length === 0;

    }


    if (exportButton) {

        exportButton.disabled =
            state.semanticMemory.length === 0;

    }


    if (forgetButton) {

        forgetButton.disabled =
            !state.selectedMemory;

    }
}


/* =========================================================
   MANUAL CONSOLIDATE
========================================================= */

function manualConsolidate() {

    const result =
        consolidateMemory();


    if (result) {

        renderMemoryCards();

        renderKnowledgeGraph();

        selectMemory(
            "semantic"
        );


        setPipelineStage(
            "consolidated",
            "Memory manually consolidated"
        );


        renderDecisionTrace([

            {

                label:
                    "Consolidation",

                value:
                    `
                        Episodic information became
                        <strong>
                            Semantic Memory
                        </strong>.
                    `

            },

            {

                label:
                    "Knowledge",

                value:
                    `
                        <strong>
                            ${escapeHTML(
                                result.subject
                            )}
                        </strong>

                        →

                        ${escapeHTML(
                            result.relation
                        )}

                        →

                        <strong>
                            ${escapeHTML(
                                result.object
                            )}
                        </strong>
                    `

            }

        ]);

    }
    else {

        pipelineStatus.textContent =
            "Nothing new to consolidate.";

    }


    updateActionButtons();
}


/* =========================================================
   MANUAL EXPORT
========================================================= */

function manualExport() {

    if (
        state.semanticMemory.length === 0
    ) {

        pipelineStatus.textContent =
            "No semantic knowledge to export.";

        return;

    }


    const bundle =
        exportKnowledgeBundle();


    state.externalKnowledge.push(
        bundle
    );


    renderMemoryCards();

    updateActionButtons();


    setPipelineStage(
        "exported",
        "Knowledge bundle exported"
    );


    selectMemory(
        "external"
    );


    showToast(
        "Knowledge bundle exported."
    );
}


/* =========================================================
   RETRIEVE UI
========================================================= */

function retrieveAndDisplay() {

    const query =
        memoryInput.value.trim();


    if (!query) {

        pipelineStatus.textContent =
            "Enter a question to retrieve knowledge.";

        memoryInput.focus();

        return;

    }


    const results =
        retrieveKnowledge(
            query
        );


    if (
        results.length === 0
    ) {

        pipelineStatus.textContent =
            "No matching knowledge found.";


        renderDecisionTrace([

            {

                label:
                    "Query",

                value:
                    `"${escapeHTML(query)}"`

            },

            {

                label:
                    "Retrieval",

                value:
                    "No matching semantic memories found."

            }

        ]);


        return;

    }


    const resultHTML =
        results
            .map(

                memory => `

                    <div class="detail-item">

                        <span class="detail-key">
                            Knowledge
                        </span>

                        <span class="detail-value">

                            <strong>
                                ${escapeHTML(
                                    memory.subject
                                )}
                            </strong>

                            →

                            ${escapeHTML(
                                memory.relation
                            )}

                            →

                            <strong>
                                ${escapeHTML(
                                    memory.object
                                )}
                            </strong>

                        </span>

                    </div>

                `

            )
            .join("");


    memoryDetails.innerHTML = `

        <div class="detail-list">

            <div class="detail-item">

                <span class="detail-key">
                    Query
                </span>

                <span class="detail-value">
                    ${escapeHTML(query)}
                </span>

            </div>

            ${resultHTML}

        </div>

    `;


    pipelineStatus.textContent =
        `${results.length} knowledge item(s) retrieved.`;


    renderDecisionTrace([

        {

            label:
                "Query",

            value:
                `"${escapeHTML(query)}"`

        },

        {

            label:
                "Search",

            value:
                "Semantic memory searched for matching concepts."

        },

        {

            label:
                "Result",

            value:
                `
                    Retrieved
                    <strong>
                        ${results.length}
                    </strong>
                    knowledge item(s).
                `

        }

    ]);

}


/* =========================================================
   PRESETS
========================================================= */

const presets = {

    fact:
        "FastAPI is written in Python.",

    event:
        "Agent A handed Agent B an OKF knowledge bundle.",

    question:
        "How does REST API relate to Python?",

    contradiction:
        "FastAPI is written in Java."

};


document
    .querySelectorAll(".preset-button")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const preset =
                    button.dataset.preset;


                if (
                    presets[preset]
                ) {

                    memoryInput.value =
                        presets[preset];

                    memoryInput.focus();

                }

            }
        );

    });


/* =========================================================
   PROCESS BUTTON
========================================================= */

if (processButton) {

    processButton.addEventListener(
        "click",
        processMemory
    );

}


/* =========================================================
   CTRL + ENTER
========================================================= */

if (memoryInput) {

    memoryInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" &&
                event.ctrlKey
            ) {

                event.preventDefault();

                processMemory();

            }

        }
    );

}


/* =========================================================
   MEMORY CARD CLICK
========================================================= */

document
    .querySelectorAll(".memory-card")
    .forEach(card => {

        card.addEventListener(
            "click",
            () => {

                selectMemory(
                    card.dataset.memoryType
                );

            }
        );

    });


/* =========================================================
   MEMORY DETAILS BUTTONS
========================================================= */

document
    .querySelectorAll(".memory-details-button")
    .forEach(button => {

        button.addEventListener(
            "click",
            event => {

                event.stopPropagation();


                const type =
                    button.dataset.details;


                if (type) {

                    selectMemory(
                        type
                    );

                }

            }
        );

    });


/* =========================================================
   CONSOLIDATE BUTTON
========================================================= */

if (consolidateButton) {

    consolidateButton.addEventListener(
        "click",
        manualConsolidate
    );

}


/* =========================================================
   EXPORT BUTTON
========================================================= */

if (exportButton) {

    exportButton.addEventListener(
        "click",
        manualExport
    );

}


/* =========================================================
   RETRIEVE BUTTON
========================================================= */

if (retrieveButton) {

    retrieveButton.addEventListener(
        "click",
        retrieveAndDisplay
    );

}


/* =========================================================
   FORGET BUTTON
========================================================= */

if (forgetButton) {

    forgetButton.addEventListener(
        "click",
        () => {

            if (
                !state.selectedMemory
            ) {

                pipelineStatus.textContent =
                    "Select a memory type first.";

                return;

            }


            forgetMemory(
                state.selectedMemory
            );

        }
    );

}


/* =========================================================
   RESIZE
========================================================= */

window.addEventListener(
    "resize",
    () => {

        renderKnowledgeGraph();

    }
);


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

    if (!toast) {
        return;
    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(
        () => {

            toast.classList.remove(
                "show"
            );

        },
        2500
    );

}


/* =========================================================
   HELPERS
========================================================= */

function wait(milliseconds) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                milliseconds
            )
    );

}


function capitalize(value) {

    return (

        value
            .charAt(0)
            .toUpperCase()

        +

        value.slice(1)

    );

}


function escapeHTML(value) {

    return String(value)
        .replace(
            /[&<>"']/g,
            character => ({

                "&":
                    "&amp;",

                "<":
                    "&lt;",

                ">":
                    "&gt;",

                '"':
                    "&quot;",

                "'":
                    "&#039;"

            })[character]
        );

}