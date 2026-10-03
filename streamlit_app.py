"""
Agent Memory Visualizer — Streamlit host
Run:  streamlit run streamlit_app.py

The visualizer is a self-contained front-end prototype (HTML, CSS and JavaScript in
agent-memory-visualizer/). This wrapper inlines the three files into one page and shows it
in an iframe, so it can be hosted on Streamlit. Everything runs in the visitor's browser;
no data is sent anywhere.
"""
import re
from pathlib import Path

import streamlit as st

SITE = Path(__file__).resolve().parent / "agent-memory-visualizer"

st.set_page_config(page_title="Agent Memory Visualizer", page_icon="🧠", layout="wide")

# Trim Streamlit's own padding so the visualizer fills the page.
st.markdown(
    "<style>.block-container{padding:0.5rem 0.5rem 0;max-width:100%}"
    "header[data-testid='stHeader']{display:none}</style>",
    unsafe_allow_html=True,
)


@st.cache_data
def build_page() -> str:
    """index.html with styles.css and app.js inlined (an iframe cannot fetch sibling files)."""
    html = (SITE / "index.html").read_text(encoding="utf-8")
    css = (SITE / "styles.css").read_text(encoding="utf-8")
    js = (SITE / "app.js").read_text(encoding="utf-8")
    html = re.sub(r'<link[^>]*href="styles\.css"[^>]*>', lambda _: f"<style>{css}</style>", html, flags=re.S)
    html = re.sub(r'<script\s+src="app\.js"\s*>\s*</script>', lambda _: f"<script>{js}</script>", html, flags=re.S)
    return html


page = build_page()  # our own static files only; never pass user-supplied HTML to an iframe
if hasattr(st, "iframe"):
    st.iframe(page, height=1500)
else:  # older Streamlit
    import streamlit.components.v1 as components

    components.html(page, height=1500, scrolling=True)
