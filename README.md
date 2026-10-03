# Agent Memory Visualizer

An interactive visualization of how an AI agent **captures, stores, consolidates and retrieves memory**. Type something the agent learned and watch it move through the pipeline, land in the right kind of memory, and show up in a knowledge graph.

It is a research prototype for building intuition. Everything runs in your browser, with no backend, no API key and no data leaving the page.

## What you can do

1. **Enter something the agent learned**, for example `FastAPI is written in Python.`
2. **Watch the pipeline run:** capture, extract, classify, store, consolidate. A decision trace explains each choice.
3. **See which memory it landed in:**

| Memory | Holds | Example input |
|---|---|---|
| **Working** | The active question or task | `What is the capital of France?` |
| **Episodic** | Events and interactions, with a timestamp | `The agent told me it found a bug.` |
| **Semantic** | Reusable knowledge as subject → relation → object | `FastAPI is written in Python.` |
| **External knowledge** | The portable bundle built from semantic memory (OKF format) | built automatically |

4. **Consolidate** episodic information into semantic memory.
5. **Retrieve** knowledge by query, **export** the knowledge bundle, or **forget** a memory type.
6. **Resolve contradictions.** If new knowledge conflicts with something already stored, the pipeline pauses and asks you to decide.
7. Explore the **knowledge graph** that grows as you add facts.

## How it decides

The classifier is deliberately simple and transparent, so you can see why each input went where it did. It is keyword-and-pattern based, not an LLM:

- A question mark, or a leading *how / what / why / where / which*, means **working** memory.
- Words like *agent, told, learned, discovered, conversation* mean **episodic** memory.
- Anything else is treated as a **semantic** statement and parsed into subject, relation and object.

If a statement has no extractable subject and object (for example `The user prefers concise answers.`), it is **not stored**, and the page says so and suggests a phrasing that works.

## Run it

It is a plain static site.

```bash
# any static server works
cd agent-memory-visualizer
python -m http.server 8000
# open http://localhost:8000
```

### As a Streamlit app

`streamlit_app.py` inlines the three files and shows them in one page, so it can be hosted on Streamlit.

```bash
pip install -r requirements.txt
streamlit run streamlit_app.py
```

To host it, go to [share.streamlit.io](https://share.streamlit.io), choose this repository, the default branch and `streamlit_app.py`. No secrets are needed.

## Files

```
agent-memory-visualizer/
  index.html   page structure
  styles.css   styling
  app.js       state, classifier, pipeline, contradiction check, graph rendering
streamlit_app.py   Streamlit host (inlines the three files above)
```
